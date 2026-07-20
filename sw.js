/* ==================================================================
 * Service Worker：离线可用的 App Shell 缓存
 * - 安装时预缓存应用外壳（HTML/CSS/JS/图标/manifest）
 * - 同源静态资源：缓存优先（后台更新）
 * - 页面导航：网络优先，离线回退到缓存的 index.html
 * - FontAwesome CDN：stale-while-revalidate
 * - 数据仍在 IndexedDB/localStorage，天然离线可用
 * 注意：每次发布更新请递增 VERSION，旧缓存会自动清理
 * ================================================================== */
const VERSION = 'fodmap-v2';
const APP_SHELL = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/style.css',
  'js/main.js',
  'js/data.js',
  'js/util.js',
  'js/db.js',
  'js/store.js',
  'js/record.js',
  'js/timeline.js',
  'js/stats.js',
  'js/me.js',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png'
];
const CDN_HOSTS = ['cdnjs.cloudflare.com']; // FontAwesome CSS 与字体

self.addEventListener('install', e=>{
  e.waitUntil(
    caches.open(VERSION)
      .then(c=> c.addAll(APP_SHELL))
      .then(()=> self.skipWaiting())
  );
});

self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys()
      .then(keys=> Promise.all(keys.filter(k=> k !== VERSION).map(k=> caches.delete(k))))
      .then(()=> self.clients.claim())
  );
});

self.addEventListener('fetch', e=>{
  const req = e.request;
  if(req.method !== 'GET') return; // API 等 POST 请求不拦截
  const url = new URL(req.url);
  if(url.protocol !== 'https:' && url.protocol !== 'http:') return;

  // 页面导航：网络优先（保证更新及时），离线回退缓存
  if(req.mode === 'navigate'){
    e.respondWith(
      fetch(req)
        .then(r=>{
          const copy = r.clone();
          caches.open(VERSION).then(c=> c.put('index.html', copy));
          return r;
        })
        .catch(()=> caches.match('index.html'))
    );
    return;
  }

  // FontAwesome CDN：stale-while-revalidate
  if(CDN_HOSTS.includes(url.host)){
    e.respondWith(
      caches.match(req).then(hit=>{
        const refresh = fetch(req).then(r=>{
          if(r.ok){
            const copy = r.clone();
            caches.open(VERSION).then(c=> c.put(req, copy));
          }
          return r;
        }).catch(()=> hit);
        return hit || refresh;
      })
    );
    return;
  }

  // 同源静态资源：缓存优先，未命中回源并写入缓存
  if(url.origin === self.location.origin){
    e.respondWith(
      caches.match(req).then(hit=> hit || fetch(req).then(r=>{
        if(r.ok){
          const copy = r.clone();
          caches.open(VERSION).then(c=> c.put(req, copy));
        }
        return r;
      }))
    );
  }
});
