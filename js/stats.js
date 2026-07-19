/* ==================================================================
 * Tab3 统计：近 30 天 FODMAP 占比 + 食材触发分析
 *            触发分析支持左滑排除食材，已排除收纳至独立折叠模块
 * ================================================================== */
import { $, esc, toast, lvlIcon, attachSwipe, setFold } from './util.js';
import { dbAll } from './db.js';
import { fodmapLevel, canonName, loadExcluded, setExcluded } from './store.js';

export async function renderStats(){
  const meals = await dbAll('meals');
  const symps = await dbAll('symptoms');

  /* --- 近30天高/中/低餐次占比 --- */
  const since = Date.now() - 30*864e5;
  const recent = meals.filter(m=> m.time >= since);
  const cnt = {high:0, medium:0, low:0, unknown:0};
  recent.forEach(m=> cnt[m.maxLevel || 'unknown']++);
  const total = recent.length;
  const box = $('levelStats');
  if(!total){ box.innerHTML = '<div class="empty-tip">近 30 天暂无饮食记录</div>'; }
  else{
    const pct = k => Math.round(cnt[k]/total*100);
    box.innerHTML =
      '<div class="stat-bar">' +
        '<div style="width:' + pct('high') + '%;background:#E86A5A"></div>' +
        '<div style="width:' + pct('medium') + '%;background:#E5B93E"></div>' +
        '<div style="width:' + pct('low') + '%;background:#3BAF7C"></div>' +
        '<div style="width:' + pct('unknown') + '%;background:#D8D2C6"></div>' +
      '</div>' +
      '<div class="legend">' +
        '<span>' + lvlIcon('high') + ' 高 ' + cnt.high + ' 餐（' + pct('high') + '%）</span>' +
        '<span>' + lvlIcon('medium') + ' 中 ' + cnt.medium + ' 餐（' + pct('medium') + '%）</span>' +
        '<span>' + lvlIcon('low') + ' 低 ' + cnt.low + ' 餐（' + pct('low') + '%）</span>' +
        (cnt.unknown ? '<span>' + lvlIcon('unknown') + ' 未知 ' + cnt.unknown + ' 餐</span>' : '') +
      '</div>';
  }

  /* --- 食材触发分析：食用后24h内出现症状次数 / 总食用次数 --- */
  const map = {}; // 归一化食材名 -> {total, sympt}
  meals.forEach(m=>{
    const names = [...new Set(m.ingredients.map(g=> canonName(g.name)))];
    names.forEach(n=>{
      if(!map[n]) map[n] = {total:0, sympt:0};
      map[n].total++;
      // 该餐后 24 小时内是否有症状
      const has = symps.some(s=> s.time >= m.time && s.time <= m.time + 24*3600*1000);
      if(has) map[n].sympt++;
    });
  });
  const rows = Object.entries(map)
    .filter(([,v])=> v.total >= 5)
    .sort((a,b)=> (b[1].sympt/b[1].total) - (a[1].sympt/a[1].total) || b[1].total - a[1].total);
  const tbox = $('trigStats');
  tbox.innerHTML = '';
  if(!rows.length){ tbox.innerHTML = '<div class="empty-tip">数据不足：同一食材需出现至少 5 次</div>'; return; }

  // 分组：已排除（左滑收纳）/ 触发率>0 的风险食材 / 从未引发症状的安心食材
  const excluded = loadExcluded();
  const exRows = rows.filter(([n])=> excluded.includes(n));
  const risky  = rows.filter(([n,v])=> v.sympt > 0 && !excluded.includes(n));
  const safe   = rows.filter(([n,v])=> v.sympt === 0 && !excluded.includes(n));

  const mkRow = (name, v)=>{
    const rate = v.sympt / v.total;
    const lv = fodmapLevel(name);
    const div = document.createElement('div');
    div.className = 'trig-row';
    div.innerHTML =
      '<div class="trig-top">' +
        '<span>' + lvlIcon(lv) + '</span>' +
        '<span class="trig-name">' + esc(name) + '</span>' +
        '<span class="trig-rate">' + Math.round(rate*100) + '%</span>' +
      '</div>' +
      '<div class="trig-bar"><i style="width:' + Math.round(rate*100) + '%"></i></div>' +
      '<div class="trig-meta">' + v.sympt + '/' + v.total + ' 次食用后出现症状</div>';
    return div;
  };

  /* 左滑条目：滑出操作按钮（排除/恢复），点击执行并重绘 */
  const mkSwipeRow = (name, v, actLabel, isRestore)=>{
    const item = document.createElement('div');
    item.className = 'trig-item';
    const act = document.createElement('button');
    act.className = 'trig-act' + (isRestore ? ' restore' : '');
    act.textContent = actLabel;
    const body = document.createElement('div');
    body.className = 'trig-body swipe-body';
    body.appendChild(mkRow(name, v));
    act.addEventListener('click', ()=>{
      setExcluded(name, !isRestore);
      toast(isRestore ? ('已将「' + name + '」移回分析列表') : ('已将「' + name + '」移入已排除'));
      renderStats();
    });
    item.appendChild(act);
    item.appendChild(body);
    attachSwipe(body);
    return item;
  };

  if(!risky.length && !safe.length){
    tbox.innerHTML = '<div class="empty-tip">食材均已排除，见下方「已排除食材」</div>';
  }else{
    risky.forEach(([n,v])=> tbox.appendChild(mkSwipeRow(n, v, '排除', false)));

    if(safe.length){
      const det = document.createElement('details');
      det.className = 'safe-fold';
      det.innerHTML =
        '<summary><i class="fa-solid fa-circle-chevron-down fa-only" aria-hidden="true"></i><span class="fa-fallback">▾</span> 绿色安心食材（' + safe.length + ' 种，食用后未出现症状）</summary>';
      const inner = document.createElement('div');
      inner.className = 'safe-list';
      safe.forEach(([n,v])=> inner.appendChild(mkSwipeRow(n, v, '排除', false)));
      det.appendChild(inner);
      tbox.appendChild(det);
    }
  }

  /* 已排除食材独立模块：默认折叠仅展示数量，点按展开查看明细（可左滑恢复） */
  if(exRows.length){
    const fold = document.createElement('div');
    fold.className = 'ex-fold';
    const head = document.createElement('button');
    head.className = 'ex-head';
    head.innerHTML =
      '<i class="fa-solid fa-box-archive fa-only" aria-hidden="true"></i>' +
      '已排除食材（' + exRows.length + '）' +
      '<span class="ex-tip">点按展开</span>' +
      '<i class="fa-solid fa-chevron-down ex-chev fa-only" aria-hidden="true"></i><span class="fa-fallback ex-chev">▾</span>';
    const coll = document.createElement('div');
    coll.className = 'ex-coll fold-coll';
    const inner = document.createElement('div');
    inner.className = 'ex-inner';
    exRows.forEach(([n,v])=> inner.appendChild(mkSwipeRow(n, v, '恢复', true)));
    coll.appendChild(inner);
    fold.appendChild(head);
    fold.appendChild(coll);
    tbox.appendChild(fold);

    let open = false;
    setFold(coll, true, false); // 初始折叠，无动画
    head.addEventListener('click', ()=>{
      open = !open;
      head.classList.toggle('open', open);
      head.querySelector('.ex-tip').textContent = open ? '点按收起' : '点按展开';
      setFold(coll, !open, true);
    });
  }
}
