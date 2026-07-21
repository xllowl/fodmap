/* ==================================================================
 * Tab4 知识库：常见食物 FODMAP 值速查（内置表 + 用户自定义定级）
 * ================================================================== */
import { FODMAP_DB, LEVEL_TEXT, LEVEL_COLOR } from './data.js';
import { $, esc } from './util.js';
import { loadCustom } from './store.js';

let selCat = '全部';
let keyword = '';

export function renderKB(){
  // 自定义定级优先展示，其后为内置表
  const custom = loadCustom();
  const customItems = Object.entries(custom).map(([name, level])=>({
    name, alias: [], cat: '自定义', level, note: '手动定级'
  }));
  const all = customItems.concat(FODMAP_DB);

  // 分类 chips（内置分类 + 自定义）
  const cats = ['全部', ...new Set(FODMAP_DB.map(e=> e.cat)), '自定义'];
  if(!cats.includes(selCat)) selCat = '全部';
  const catBox = $('kbCats');
  catBox.innerHTML = '';
  cats.forEach(c=>{
    const b = document.createElement('button');
    b.textContent = c;
    b.className = selCat === c ? 'sel' : '';
    b.addEventListener('click', ()=>{ selCat = c; renderKB(); });
    catBox.appendChild(b);
  });

  // 过滤：分类 + 关键词（名称/别名）
  const kw = keyword.trim();
  const rows = all.filter(e=>{
    if(selCat !== '全部' && e.cat !== selCat) return false;
    if(!kw) return true;
    return e.name.includes(kw) || (e.alias && e.alias.some(a=> a.includes(kw)));
  });

  // 统计行
  const cnt = {high:0, medium:0, low:0, unknown:0};
  rows.forEach(e=> cnt[e.level in cnt ? e.level : 'unknown']++);
  $('kbCount').textContent =
    '共 ' + rows.length + ' 项 · 高 ' + cnt.high + ' 中 ' + cnt.medium + ' 低 ' + cnt.low +
    (cnt.unknown ? ' 未知 ' + cnt.unknown : '');

  const list = $('kbList');
  list.innerHTML = '';
  if(!rows.length){ list.innerHTML = '<div class="empty-tip">没有匹配的食物</div>'; return; }
  rows.forEach(e=>{
    const div = document.createElement('div');
    div.className = 'kb-row';
    const lvColor = LEVEL_COLOR[e.level] || LEVEL_COLOR.unknown;
    div.innerHTML =
      '<span class="dot dot-' + e.level + '"></span>' +
      '<div class="kb-main">' +
        '<span class="kb-name">' + esc(e.name) + '</span>' +
        (e.alias && e.alias.length ? '<span class="kb-alias">' + esc(e.alias.join(' / ')) + '</span>' : '') +
        (e.note ? '<span class="kb-note">' + esc(e.note) + '</span>' : '') +
      '</div>' +
      '<span class="kb-lv" style="color:' + lvColor + '">' + (LEVEL_TEXT[e.level] || '未知') + '</span>';
    list.appendChild(div);
  });
}

export function initKB(){
  $('kbSearch').addEventListener('input', ()=>{ keyword = $('kbSearch').value; renderKB(); });
}
