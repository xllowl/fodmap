/* ==================================================================
 * 入口：Tab 切换 + 各模块初始化
 * ================================================================== */
import { openDB } from './db.js';
import { initRecord } from './record.js';
import { initTimeline, renderTimeline } from './timeline.js';
import { renderStats } from './stats.js';
import { initMe, renderBatchPanel } from './me.js';

/* ==================================================================
 * Tab 切换
 * ================================================================== */
function switchTab(tab){
  document.querySelectorAll('#tabbar button').forEach(b=> b.classList.toggle('active', b.dataset.tab===tab));
  document.querySelectorAll('section.tabpage').forEach(p=> p.classList.toggle('active', p.id==='page-'+tab));
  if(tab==='timeline') renderTimeline();
  if(tab==='stats') renderStats();
  if(tab==='me') renderBatchPanel(); // 食材可能新增/改级，每次进入刷新批量面板
  window.scrollTo(0,0);
}
document.querySelectorAll('#tabbar button').forEach(btn=>{
  btn.addEventListener('click', ()=> switchTab(btn.dataset.tab));
});

/* ==================================================================
 * 初始化
 * ================================================================== */
/* FontAwesome 兜底检测：link onerror 之外，延迟确认字体真正注册成功 */
(function faHealthCheck(){
  setTimeout(()=>{
    const loaded = document.fonts && [...document.fonts].some(f=> f.family.includes('Font Awesome') && f.status === 'loaded');
    if(!loaded) document.body.classList.add('no-fa');
  }, 1500);
})();

(async function init(){
  try{ await openDB(); }
  catch(e){ alert('IndexedDB 打开失败，请确认未处于无痕模式'); return; }
  initRecord(switchTab);
  initTimeline();
  initMe();
})();
