/* ==================================================================
 * 工具函数（DOM / 格式化 / 模态框 / 手势 / 折叠动画）
 * ================================================================== */
import { LEVEL_COLOR } from './data.js';

export const $ = id => document.getElementById(id);

export function esc(s){
  return String(s==null?'':s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
export function pad(n){ return String(n).padStart(2,'0'); }
export function dayKey(ts){ const d=new Date(ts); return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()); }
export function hm(ts){ const d=new Date(ts); return pad(d.getHours())+':'+pad(d.getMinutes()); }
export function dtLocalVal(ts){ const d=new Date(ts); return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())+'T'+pad(d.getHours())+':'+pad(d.getMinutes()); }

/* FODMAP 级别 → FA圆点图标（替代原生 emoji，带降级文字） */
export function lvlIcon(lv){
  const c = LEVEL_COLOR[lv] || LEVEL_COLOR.unknown;
  const label = {high:'高FODMAP',medium:'中FODMAP',low:'低FODMAP',unknown:'未知级别'}[lv] || '未知级别';
  return '<i class="fa-solid fa-circle fa-only" style="color:' + c + ';font-size:.7em" aria-label="' + label + '" role="img"></i>' +
         '<span class="fa-fallback" style="color:' + c + '" role="img" aria-label="' + label + '">●</span>';
}
/* 症状图标（CDN 失败时降级为文字点） */
export function symIcon(cls, label){
  return '<i class="fa-solid ' + cls + ' fa-only" aria-label="' + label + '" role="img"></i>' +
         '<span class="fa-fallback" role="img" aria-label="' + label + '">◆</span>';
}

export function toast(msg, ms=2200){
  const t=document.createElement('div'); t.className='toast'; t.textContent=msg;
  document.body.appendChild(t); setTimeout(()=>t.remove(), ms);
}

/* 通用模态对话框：showConfirm 返回 Promise<boolean>；showPrompt 返回 Promise<string|null> */
export function showModal({title, desc='', input=null, inputType='text'}){
  return new Promise(resolve=>{
    $('modalTitle').textContent = title;
    $('modalDesc').textContent = desc;
    const inp = $('modalInput');
    inp.type = inputType;
    inp.style.display = input === null ? 'none' : 'block';
    inp.value = input || '';
    $('modalMask').classList.add('show');
    const done = val=>{
      $('modalMask').classList.remove('show');
      $('modalOk').onclick = $('modalCancel').onclick = null;
      inp.type = 'text';
      resolve(val);
    };
    $('modalOk').onclick = ()=> done(input === null ? true : inp.value.trim() || null);
    $('modalCancel').onclick = ()=> done(input === null ? false : null);
    if(input !== null) setTimeout(()=> inp.focus(), 50);
  });
}
export const showConfirm = (title, desc)=> showModal({title, desc});
export const showPrompt  = (title, desc, def)=> showModal({title, desc, input: def || ''});

export function download(filename, content, mime){
  const blob = new Blob([content], {type: mime||'text/plain;charset=utf-8'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = filename;
  document.body.appendChild(a); a.click();
  setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); }, 500);
}

/* 左滑手势：内容左移露出操作按钮（时间线删除 / 触发分析排除 通用）
 * body 需带 .swipe-body 类，互斥收起其他已滑开的条目 */
export function attachSwipe(body){
  let sx = 0, dx = 0, dragging = false;
  const closeOthers = ()=> document.querySelectorAll('.swipe-body').forEach(b=>{ if(b!==body) b.style.transform='translateX(0)'; });
  body.addEventListener('touchstart', e=>{
    sx = e.touches[0].clientX; dx = 0; dragging = true;
    body.style.transition = 'none';
    closeOthers();
  }, {passive:true});
  body.addEventListener('touchmove', e=>{
    if(!dragging) return;
    dx = Math.min(0, e.touches[0].clientX - sx); // 只允许向左
    dx = Math.max(dx, -90);
    body.style.transform = 'translateX(' + dx + 'px)';
  }, {passive:true});
  body.addEventListener('touchend', ()=>{
    if(!dragging) return;
    dragging = false;
    body.style.transition = '';
    // 滑动超过 40px 则展开操作按钮，否则回弹
    body.style.transform = dx < -40 ? 'translateX(-76px)' : 'translateX(0)';
  });
}

/* 通用折叠动画：collEl 为外层容器（.fold-coll，overflow:hidden），
 * JS 精确测量高度做 0.28s 过渡；展开完成后高度恢复 auto 以自适应内容变化 */
export function setFold(collEl, collapsed, animate = true){
  const startH = collEl.getBoundingClientRect().height;
  const targetH = collapsed ? 0 : collEl.scrollHeight;
  collEl.classList.toggle('closed', collapsed);
  if(!animate || startH === targetH){
    collEl.style.height = collapsed ? '0px' : '';
    return;
  }
  collEl.style.height = startH + 'px';
  void collEl.offsetHeight; // 强制 reflow，确保过渡从当前高度开始
  collEl.style.height = targetH + 'px';
  const onEnd = e=>{
    if(e.propertyName !== 'height') return;
    collEl.removeEventListener('transitionend', onEnd);
    collEl.style.height = collapsed ? '0px' : '';
  };
  collEl.addEventListener('transitionend', onEnd);
}
