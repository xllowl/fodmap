/* ==================================================================
 * Tab2 时间线：日历视图 + 按天分组倒序 + 左滑删除
 *              + 餐次徽标（早/午/晚/点心）+ 单餐次折叠展开
 * ================================================================== */
import { AMT_SHORT, SYM_TYPES, MEAL_TYPES, MEAL_TYPE_MAP, mealTypeOf,
         LEVEL_TEXT, evalMealScore, mealLevelOf, mealScoreOf,
         moodFace, moodTier, BRISTOL_TYPES } from './data.js';
import { $, esc, pad, dayKey, hm, dtLocalVal, toast, showConfirm, showModal,
         lvlIcon, symIcon, attachSwipe, setFold } from './util.js';
import { dbAll, dbDel, dbPut } from './db.js';
import { isMealCollapsed, setMealCollapsed } from './store.js';

/* ============ 日历视图：每日症状着色 + 饮食小点；点日期切换查看 ============ */
let calCursor = new Date(); // 当前显示的月份
calCursor.setDate(1);
let selDay = dayKey(Date.now()); // 当前查看的日期（时间线只显示这一天）

function renderCalendar(meals, symps){
  // 按天聚合：当日最高严重度 + 是否有饮食记录 + 显式无症状标记
  const symMap = {}, mealSet = {}, noneSet = {};
  symps.forEach(s=>{
    const k = dayKey(s.time);
    if(s.severity > 0) symMap[k] = Math.max(symMap[k]||0, s.severity);
    else noneSet[k] = true;
  });
  meals.forEach(m=>{ mealSet[dayKey(m.time)] = true; });

  const y = calCursor.getFullYear(), mo = calCursor.getMonth();
  $('calTitle').textContent = y + ' 年 ' + (mo+1) + ' 月';
  // 周一为一周第一天：计算 1 号前需补几个上月格子
  const firstDow = (new Date(y, mo, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(y, mo+1, 0).getDate();
  const grid = $('calGrid');
  grid.innerHTML = '';
  const todayK = dayKey(Date.now());
  for(let i = 0; i < firstDow + daysInMonth; i++){
    const cell = document.createElement('div');
    cell.className = 'cal-cell';
    if(i < firstDow){ cell.classList.add('other'); }
    else{
      const d = i - firstDow + 1;
      const k = y + '-' + pad(mo+1) + '-' + pad(d);
      cell.textContent = d;
      const sev = symMap[k];
      if(sev){
        cell.classList.add('has-sym');
        cell.style.background = sev <= 3 ? '#F5C8D8' : sev <= 6 ? '#EC8FAF' : '#D14D3D';
        cell.title = '当日最高症状严重度 ' + sev + '/10';
      }else if(mealSet[k] || noneSet[k]){ cell.classList.add('no-sym'); } // 有记录但无症状 / 主动标记无症状
      if(k === todayK) cell.classList.add('today');
      if(k === selDay) cell.classList.add('sel'); // 当前查看的日期
      if(mealSet[k]){ const dot = document.createElement('span'); dot.classList.add('meal-dot'); cell.appendChild(dot); }
      // 点日期切换查看的记录
      cell.addEventListener('click', ()=>{ selDay = k; renderTimeline(); });
    }
    grid.appendChild(cell);
  }
}

/* ============ 时间线列表：只显示选中日期的记录 ============ */
export async function renderTimeline(){
  const meals = (await dbAll('meals')).map(m=>({...m, _kind:'meal'}));
  const symps = (await dbAll('symptoms')).map(s=>({...s, _kind:'sym'}));
  const moods = (await dbAll('moods')).map(m=>({...m, _kind:'mood'}));
  const bowels = (await dbAll('bowels')).map(b=>({...b, _kind:'bowel'}));
  renderCalendar(meals, symps);
  const items = meals.concat(symps, moods, bowels)
    .filter(it=> dayKey(it.time) === selDay)
    .sort((a,b)=> b.time - a.time);
  const box = $('timelineList');
  box.innerHTML = '';
  // 日期标题：今天标注；查看历史日期时提供「回到今天」
  const isToday = selDay === dayKey(Date.now());
  const h = document.createElement('div');
  h.className = 'day-title';
  h.innerHTML = '<span>' + esc(selDay) + (isToday ? ' · 今天' : '') + '</span>' +
    (isToday ? '' : '<button id="backToday" class="back-today">回到今天</button>');
  box.appendChild(h);
  if(!isToday) h.querySelector('#backToday').addEventListener('click', ()=>{
    selDay = dayKey(Date.now());
    renderTimeline();
  });
  if(!items.length){
    const tip = document.createElement('div');
    tip.className = 'card empty-tip';
    tip.textContent = '这一天还没有记录，去「记录」页添加吧';
    box.appendChild(tip);
    return;
  }
  items.forEach(it=> box.appendChild(buildTimelineItem(it)));
}

/* 生成单个时间线条目（饮食或症状） */
function buildTimelineItem(it){
  const wrap = document.createElement('div');
  wrap.className = 'tl-item';
  const del = document.createElement('button');
  del.className = 'tl-del'; del.textContent = '删除';
  const body = document.createElement('div');
  body.className = 'tl-body swipe-body';

  if(it._kind === 'meal'){
    const chips = it.ingredients.map(g=>
      '<span class="chip ' + g.fodmap + '">' + esc(g.name) +
      (g.inferred ? '<span class="inf">[推测]</span>' : '') +
      '·' + (AMT_SHORT[g.amount]||'中') + '</span>'
    ).join('');
    const mt = MEAL_TYPE_MAP[mealTypeOf(it)] || MEAL_TYPE_MAP.snack;
    // 核心统计：该餐次内食物的高/中/低/未知数量（折叠后展示）
    const cnt = {high:0, medium:0, low:0, unknown:0};
    it.ingredients.forEach(g=>{ if(cnt[g.fodmap] !== undefined) cnt[g.fodmap]++; else cnt.unknown++; });
    const summary =
      (cnt.high   ? '<span class="sum-item">' + lvlIcon('high')   + '×' + cnt.high   + '</span>' : '') +
      (cnt.medium ? '<span class="sum-item">' + lvlIcon('medium') + '×' + cnt.medium + '</span>' : '') +
      (cnt.low    ? '<span class="sum-item">' + lvlIcon('low')    + '×' + cnt.low    + '</span>' : '') +
      (cnt.unknown? '<span class="sum-item">' + lvlIcon('unknown')+ '×' + cnt.unknown+ '</span>' : '') +
      '<span class="sum-item">共 ' + it.ingredients.length + ' 种食材 · 评分 ' + mealScoreOf(it) + '</span>';
    body.innerHTML =
      '<div class="tl-head">' +
        '<button class="tl-time" data-act="time" title="点按修改时间">' + hm(it.time) + '</button>' +
        '<button class="tl-lv" data-act="lv" title="整餐级别（评分 ' + mealScoreOf(it) + '），点按修改颜色">' + lvlIcon(mealLevelOf(it)) + '</button>' +
        '<span class="tl-dish">' + esc(it.dishName) + '</span>' +
        '<button class="tl-mtype" data-act="mtype" title="点按切换餐次">' + mt.t + '</button>' +
        '<button class="tl-fold" data-act="fold" aria-label="折叠/展开餐次"><i class="fa-solid fa-chevron-up fa-only" aria-hidden="true"></i><span class="fa-fallback">▴</span></button>' +
        (it.thumbnail ? '<img class="tl-thumb" src="' + it.thumbnail + '">' : '') +
      '</div>' +
      '<div class="tl-coll fold-coll"><div class="tl-coll-inner">' +
        '<div class="tl-chips">' + chips + '</div>' +
        (it.note ? '<div class="tl-note">备注：' + esc(it.note) + '</div>' : '') +
      '</div></div>' +
      '<div class="tl-summary">' + summary + '</div>';

    // ---- 单餐次折叠/展开：折叠后仅保留头部（餐次名称）+ 核心统计行 ----
    const coll = body.querySelector('.tl-coll');
    const sumEl = body.querySelector('.tl-summary');
    const headEl = body.querySelector('.tl-head');
    const foldBtn = body.querySelector('[data-act=fold]');
    const applyFold = (collapsed, animate)=>{
      setFold(coll, collapsed, animate);
      sumEl.classList.toggle('show', collapsed);
      foldBtn.classList.toggle('closed', collapsed);
      headEl.classList.toggle('folded', collapsed);
    };
    let folded = isMealCollapsed(it.id);
    applyFold(folded, false); // 初始状态无动画直接应用
    foldBtn.addEventListener('click', ()=>{
      folded = !folded;
      setMealCollapsed(it.id, folded);
      applyFold(folded, true);
    });

    // ---- 整餐色点：点按循环 低→中→高 修改颜色（标记为手动级别，批量调整不再覆盖） ----
    const lvBtn = body.querySelector('[data-act=lv]');
    lvBtn.addEventListener('click', async ()=>{
      const order = ['low','medium','high'];
      const next = order[(order.indexOf(mealLevelOf(it))+1) % order.length];
      it.level = next;
      it.levelManual = true;
      it.score = mealScoreOf(it);
      delete it._kind;
      await dbPut('meals', it);
      lvBtn.innerHTML = lvlIcon(next);
      toast('整餐颜色已改为「' + LEVEL_TEXT[next] + '」');
    });

    // ---- 餐次徽标：点按循环切换 早餐→午餐→晚餐→点心 ----
    const mtBtn = body.querySelector('[data-act=mtype]');
    mtBtn.addEventListener('click', async ()=>{
      const order = MEAL_TYPES.map(t=>t.k);
      const next = order[(order.indexOf(mealTypeOf(it))+1) % order.length];
      it.mealType = next; delete it._kind;
      await dbPut('meals', it);
      mtBtn.textContent = MEAL_TYPE_MAP[next].t;
      toast('已改为「' + MEAL_TYPE_MAP[next].t + '」');
    });
  }else if(it._kind === 'sym'){
    const meta = SYM_TYPES.find(s=>s.t===it.type) || {i:'fa-stethoscope'};
    const none = it.severity === 0; // 显式无症状标记
    body.innerHTML =
      '<div class="tl-sym">' +
        '<span class="ico"' + (none ? ' style="color:#1E7A4F"' : '') + '>' + symIcon(meta.i, it.type) + '</span>' +
        '<button class="tl-time" data-act="time" title="点按修改时间">' + hm(it.time) + '</button>' +
        '<span>' + esc(it.type) + '</span>' +
        (none ? '<span class="sev-badge ok">无症状</span>' : '<span class="sev-badge">' + it.severity + '/10</span>') +
      '</div>' +
      (it.note ? '<div class="tl-note">' + esc(it.note) + '</div>' : '');
  }else if(it._kind === 'mood'){
    const f = moodFace(it.score), t = moodTier(it.score);
    body.innerHTML =
      '<div class="tl-sym">' +
        '<span class="ico" style="color:' + t.seg + '">' + symIcon(f.i, '心情') + '</span>' +
        '<button class="tl-time" data-act="time" title="点按修改时间">' + hm(it.time) + '</button>' +
        '<span>心情 · ' + f.t + '</span>' +
        '<span class="sev-badge" style="background:' + t.bg + ';color:' + t.fg + '">' + it.score + '/10</span>' +
      '</div>' +
      (it.note ? '<div class="tl-note">' + esc(it.note) + '</div>' : '');
  }else{ // bowel 排便条目（布里斯托类型）
    const b = BRISTOL_TYPES.find(x=> x.n === it.type) || BRISTOL_TYPES[3];
    body.innerHTML =
      '<div class="tl-sym">' +
        '<span class="ico" style="color:' + b.c + '">' + symIcon('fa-poop', '排便') + '</span>' +
        '<button class="tl-time" data-act="time" title="点按修改时间">' + hm(it.time) + '</button>' +
        '<span>排便 · ' + b.t + '</span>' +
        '<span class="sev-badge" style="background:' + b.bg + ';color:' + b.fg + '">类型 ' + b.n + '</span>' +
      '</div>' +
      (it.note ? '<div class="tl-note">' + esc(it.note) + '</div>' : '');
  }

  // 点时间弹出时间编辑框
  const timeBtn = body.querySelector('[data-act=time]');
  if(timeBtn) timeBtn.addEventListener('click', ()=> editItemTime(it));

  del.addEventListener('click', async ()=>{
    if(!await showConfirm('删除记录', '确认删除这条记录？')) return;
    await dbDel(STORE_OF[it._kind], it.id);
    renderTimeline();
  });
  wrap.appendChild(del);
  wrap.appendChild(body);
  attachSwipe(body);
  return wrap;
}

/* 条目类型 → IndexedDB store 名 */
const STORE_OF = {meal:'meals', sym:'symptoms', mood:'moods', bowel:'bowels'};

/* 修改条目时间（饮食/症状/心情/排便通用），保存后刷新时间线 */
async function editItemTime(it){
  const storeName = STORE_OF[it._kind];
  const desc = it._kind === 'meal' ? ('「' + it.dishName + '」的用餐时间')
           : it._kind === 'mood' ? '「心情」的记录时间'
           : it._kind === 'bowel' ? '「排便」的记录时间'
           : ('「' + it.type + '」的记录时间');
  const v = await showModal({
    title: '修改时间',
    desc,
    input: dtLocalVal(it.time), inputType: 'datetime-local'
  });
  if(!v) return;
  const t = new Date(v).getTime();
  if(isNaN(t)){ toast('时间格式不正确'); return; }
  it.time = t; delete it._kind;
  await dbPut(storeName, it);
  renderTimeline();
  toast('时间已更新');
}

export function initTimeline(){
  $('calPrev').addEventListener('click', ()=>{ calCursor.setMonth(calCursor.getMonth()-1); renderTimeline(); });
  $('calNext').addEventListener('click', ()=>{ calCursor.setMonth(calCursor.getMonth()+1); renderTimeline(); });
}
