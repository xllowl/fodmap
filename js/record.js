/* ==================================================================
 * Tab1 记录：拍照分析 / 食材确认 / 模板 / 症状记录
 * ================================================================== */
import { SYS_PROMPT, FODMAP_PROMPT, AMT_CYCLE, LVL_CYCLE, LEVEL_TEXT,
         SYM_TYPES, MEAL_TYPES, deriveMealType, moodFace, moodTier,
         evalMealScore, mealLevelFromScore } from './data.js';
import { $, esc, toast, showConfirm, showPrompt, dtLocalVal, symIcon } from './util.js';
import { dbAdd, dbAll, dbDel } from './db.js';
import { lookupFodmap, fodmapLevel, saveCustomLevel, loadSettings } from './store.js';

export const state = {
  photo: null,            // 1024px base64（发 API 用）
  thumb: null,            // 200px base64（存库用）
  parsed: null,           // 待确认的解析结果 {dish, ingredients:[{name,amount,inferred,fodmap,manualLevel}]}
  mealType: null,         // 待确认记录的餐次（breakfast/lunch/dinner/snack）
  mealTypeManual: false,  // 用户是否手动选过餐次（未手动则跟随时间自动推断）
  mealLevel: null,        // 待确认记录的整餐级别（high/medium/low）
  mealLevelManual: false  // 用户是否手动改过整餐级别（未手动则按评分自动评估）
};
let switchTabFn = null;   // 由 main.js 注入，用于「未配置 API」时跳转到我的页

/* ==================================================================
 * 拍照与图片预处理
 * ================================================================== */
/* 拍照/相册两个入口：带 capture 的走相机，不带的走相册 */
export function renderPhotoPicker(){
  $('photoArea').innerHTML =
    '<div class="photo-btns">' +
      '<button class="photo-btn" id="takeBtn" aria-label="拍照"><span class="ico"><i class="fa-solid fa-camera fa-btn" aria-hidden="true"></i></span><span>拍照</span></button>' +
      '<button class="photo-btn" id="pickBtn" aria-label="从相册选择"><span class="ico"><i class="fa-solid fa-image fa-btn" aria-hidden="true"></i></span><span>从相册选择</span></button>' +
    '</div>';
  $('takeBtn').addEventListener('click', ()=> $('photoInput').click());
  $('pickBtn').addEventListener('click', ()=> $('galleryInput').click());
}
async function onPhotoPicked(e){
  const file = e.target.files[0];
  if(!file) return;
  try{
    const {full, thumb} = await processImage(file);
    state.photo = full; state.thumb = thumb;
    $('photoArea').innerHTML =
      '<div class="preview-wrap"><img id="photoPreview" src="'+full+'">' +
      '<button class="re-pick" id="rePickBtn">重选</button></div>';
    $('rePickBtn').addEventListener('click', renderPhotoPicker);
  }catch(err){ toast('图片读取失败，请换一张'); }
  e.target.value = '';
}

/* canvas 缩放：最长边 1024px，JPEG 0.7 → base64；同时生成 200px 缩略图 */
function processImage(file){
  return new Promise((res, rej)=>{
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = ()=>{
      const mk = (max, q)=>{
        const sc = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width*sc)), h = Math.max(1, Math.round(img.height*sc));
        const c = document.createElement('canvas'); c.width = w; c.height = h;
        c.getContext('2d').drawImage(img, 0, 0, w, h);
        return c.toDataURL('image/jpeg', q);
      };
      const full = mk(1024, 0.7), thumb = mk(200, 0.6);
      URL.revokeObjectURL(url);
      res({full, thumb});
    };
    img.onerror = rej;
    img.src = url;
  });
}

/* ==================================================================
 * 调用多模态 LLM 分析食材（OpenAI 兼容 chat completions）
 * ================================================================== */
/* 批量向大模型查询未知食材的 FODMAP 级别；失败静默返回 null（不阻塞主流程） */
async function askFodmapLevels(names){
  if(!names.length) return [];
  const s = loadSettings();
  try{
    const resp = await fetch(s.baseUrl, {
      method:'POST',
      headers:{ 'Content-Type':'application/json', 'Authorization':'Bearer ' + s.apiKey },
      body: JSON.stringify({
        model: s.model,
        messages: [
          {role:'system', content: FODMAP_PROMPT},
          {role:'user',   content: '请定级：' + names.join('、')}
        ],
        temperature: 0.1
      })
    });
    if(!resp.ok) return null;
    const data = await resp.json();
    const content = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    if(!content) return null;
    const t = content.replace(/```(?:json)?/gi, '');
    const i = t.indexOf('['), j = t.lastIndexOf(']');
    if(i < 0 || j <= i) return null;
    const arr = JSON.parse(t.slice(i, j+1));
    return Array.isArray(arr) ? arr : null;
  }catch(e){ return null; }
}

async function analyze(){
  const s = loadSettings();
  if(!s.apiKey){
    if(await showConfirm('未配置 API', '尚未填写 API Key，是否前往「我的」页面设置？') && switchTabFn) switchTabFn('me');
    return;
  }
  if(!state.photo && !$('noteInput').value.trim()){
    toast('请先拍照或填写备注'); return;
  }
  const btn = $('analyzeBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin fa-only" aria-hidden="true"></i><span class="spin fa-fallback"></span> 分析中…';
  try{
    // 组装 user message：base64 图放 image_url 字段
    const userContent = [];
    if(state.photo) userContent.push({type:'image_url', image_url:{url: state.photo}});
    const note = $('noteInput').value.trim();
    userContent.push({type:'text', text:
      '备注：' + (note || '（无）') +
      (state.photo ? '\n请分析照片中的这餐。' : '\n（无照片，请根据备注推断这餐最可能的食材）')});
    const resp = await fetch(s.baseUrl, {
      method:'POST',
      headers:{ 'Content-Type':'application/json', 'Authorization':'Bearer ' + s.apiKey },
      body: JSON.stringify({
        model: s.model,
        messages: [
          {role:'system', content: SYS_PROMPT},
          {role:'user',   content: userContent}
        ],
        temperature: 0.2
      })
    });
    if(!resp.ok){
      const t = await resp.text().catch(()=> '');
      throw new Error('API 返回 ' + resp.status + '：' + t.slice(0, 150));
    }
    const data = await resp.json();
    const content = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    if(!content) throw new Error('API 返回结构异常');
    state.parsed = parseLLM(content);
    renderConfirm();
    toast('分析完成，请确认食材');
    // 后台自动批量查询本地表未收录食材的 FODMAP 级别（不阻塞确认界面）
    autoFillUnknownLevels();
  }catch(err){
    alert('分析失败：' + err.message + '\n\n可检查网络/Key 后点击「分析食材」重试。');
  }finally{
    btn.disabled = false;
    btn.textContent = '分析食材';
  }
}

/* 容错解析：剥掉 ```json 包裹与多余文本，截取第一个 { 到最后一个 } */
function parseLLM(text){
  const t = text.replace(/```(?:json)?/gi, '');
  const i = t.indexOf('{'), j = t.lastIndexOf('}');
  if(i < 0 || j <= i) throw new Error('返回内容中未找到 JSON，可重试');
  let obj;
  try{ obj = JSON.parse(t.slice(i, j+1)); }
  catch(e){ throw new Error('JSON 解析失败，可重试'); }
  if(!obj || !Array.isArray(obj.ingredients)) throw new Error('JSON 缺少 ingredients 字段');
  obj.dish = String(obj.dish || '未命名');
  obj.ingredients = obj.ingredients
    .filter(g => g && String(g.name||'').trim())
    .map(g => {
      const name = String(g.name).trim();
      return {
        name,
        amount: AMT_CYCLE.includes(g.amount) ? g.amount : '中等',
        inferred: !!g.inferred,
        fodmap: fodmapLevel(name),   // 查本地表自动标注
        manualLevel: false            // 是否被手动改过级别
      };
    });
  return obj;
}

/* 后台自动批量查询未知食材级别，回填确认界面；AI 定级同样记忆到自定义表 */
let aiReasons = {}; // 本轮 AI 定级理由 {食材名: 理由}
async function autoFillUnknownLevels(){
  if(!state.parsed) return;
  const unknown = [...new Set(state.parsed.ingredients
    .filter(g=> g.fodmap === 'unknown' && !lookupFodmap(g.name))
    .map(g=> g.name))];
  if(!unknown.length) return;
  aiReasons = {};
  const rows = await askFodmapLevels(unknown);
  if(!rows){ renderIngList(); return; } // 查询失败：保持 unknown，行内提示手动定级
  let changed = false;
  rows.forEach(r=>{
    const name = String(r.name||'').trim();
    const lv = ['high','medium','low'].includes(r.level) ? r.level : null;
    if(!name || !lv) return;
    aiReasons[name] = String(r.reason||'');
    state.parsed.ingredients.forEach(g=>{
      if(g.name === name && g.fodmap === 'unknown' && !g.manualLevel){
        g.fodmap = lv; g.aiLevel = true; changed = true;
      }
    });
    saveCustomLevel(name, lv); // AI 定级也记忆，下次同食材直接带出
  });
  if(changed && state.parsed){ renderIngList(); toast('AI 已为 ' + Object.keys(aiReasons).length + ' 种食材定级，可点色点修正'); }
}

/* ==================================================================
 * 确认界面（可编辑菜名/餐次/量级/推测标记/级别/增删）
 * ================================================================== */
function renderConfirm(){
  if(!state.parsed){ $('confirmCard').style.display='none'; return; }
  $('confirmCard').style.display = 'block';
  $('dishInput').value = state.parsed.dish;
  if(!$('mealTimeInput').value) $('mealTimeInput').value = dtLocalVal(Date.now());
  // 餐次默认按用餐时间推断；用户手动选择后不再覆盖
  if(!state.mealType){
    state.mealType = deriveMealType(new Date($('mealTimeInput').value).getTime() || Date.now());
    state.mealTypeManual = false;
  }
  renderMtypeChips();
  renderIngList();
}

/* 整餐评估行：按 级别×含量 自动评分；手动改过则保留手动级别并显示「恢复自动」 */
function updateMealEval(){
  if(!state.parsed) return;
  const score = evalMealScore(state.parsed.ingredients);
  if(!state.mealLevelManual || !state.mealLevel) state.mealLevel = mealLevelFromScore(score);
  const chip = $('mealLevelChip');
  chip.className = 'ml-chip ml-' + state.mealLevel;
  chip.textContent = LEVEL_TEXT[state.mealLevel];
  $('mealScore').textContent = '评分 ' + score;
  $('mealLevelAuto').style.display = state.mealLevelManual ? '' : 'none';
}

/* 餐次 chips：早餐/午餐/晚餐/点心 单选 */
function renderMtypeChips(){
  const box = $('mtypeChips');
  box.innerHTML = '';
  MEAL_TYPES.forEach(t=>{
    const b = document.createElement('button');
    b.type = 'button';
    b.className = state.mealType === t.k ? 'sel' : '';
    b.innerHTML = '<i class="fa-solid ' + t.i + ' fa-only" aria-hidden="true"></i> ' + t.t;
    b.addEventListener('click', ()=>{
      state.mealType = t.k;
      state.mealTypeManual = true;
      renderMtypeChips();
    });
    box.appendChild(b);
  });
}

function renderIngList(){
  const list = $('ingList');
  list.innerHTML = '';
  state.parsed.ingredients.forEach((g, idx)=>{
    const hit = lookupFodmap(g.name);
    const row = document.createElement('div');
    row.className = 'ing-row';
    row.innerHTML =
      '<button class="dot dot-' + g.fodmap + '" data-act="level" title="点按切换 高/中/低"></button>' +
      '<div class="ing-main">' +
        '<span class="ing-name">' + esc(g.name) + '</span>' +
        (g.inferred ? '<button class="tag-inferred" data-act="inferred" title="点按取消推测标记">推测</button>' : '') +
        (hit && hit.note ? '<span class="ing-note">' + esc(hit.note) + '</span>' : '') +
        (g.aiLevel && aiReasons[g.name] ? '<span class="ing-note" style="color:#A34A18">AI 定级：' + esc(aiReasons[g.name]) + '</span>' : '') +
        (!hit && !g.aiLevel ? '<span class="ing-note">本地表未收录' + (g.fodmap==='unknown' ? '，AI 查询中/点圆点手动定级' : '') + '</span>' : '') +
      '</div>' +
      '<button class="amt" data-act="amount">' + esc(g.amount) + '</button>' +
      '<button class="ing-del" data-act="del" aria-label="删除食材"><i class="fa-solid fa-xmark fa-only" aria-hidden="true"></i><span class="fa-fallback">✕</span></button>';
    row.querySelectorAll('[data-act]').forEach(el=>{
      el.addEventListener('click', ()=>{
        const act = el.dataset.act;
        if(act==='level'){ // 级别循环：未知→低→中→高，手动定级覆盖 AI 结果并记忆
          g.fodmap = LVL_CYCLE[(LVL_CYCLE.indexOf(g.fodmap)+1) % LVL_CYCLE.length];
          g.manualLevel = true;
          g.aiLevel = false;
          saveCustomLevel(g.name, g.fodmap);
        }
        if(act==='amount'){ // 量级循环：少→中→大
          g.amount = AMT_CYCLE[(AMT_CYCLE.indexOf(g.amount)+1) % AMT_CYCLE.length];
        }
        if(act==='inferred'){ g.inferred = false; }
        if(act==='del'){ state.parsed.ingredients.splice(idx, 1); }
        renderIngList();
      });
    });
    list.appendChild(row);
  });
  updateMealEval(); // 食材增删/改级/改量级后，刷新整餐评分
}

/* 批量调整联动：若确认界面有待保存记录，同步刷新其中的级别 */
export function applyLevelToPending(names, level){
  if(!state.parsed) return;
  const set = new Set(names);
  let ch = false;
  state.parsed.ingredients.forEach(g=>{
    if(set.has(g.name)){ g.fodmap = level; g.manualLevel = true; g.aiLevel = false; ch = true; }
  });
  if(ch) renderIngList();
}

/* ==================================================================
 * 模板快捷区：点击模板直接生成待确认记录
 * ================================================================== */
export async function renderTemplates(){
  const tpls = await dbAll('templates');
  const box = $('tplList');
  box.innerHTML = '';
  if(!tpls.length){ box.innerHTML = '<div class="empty-tip">保存记录时可选择存为模板</div>'; return; }
  tpls.sort((a,b)=>b.id-a.id).forEach(t=>{
    const chip = document.createElement('button');
    chip.className = 'tpl-chip';
    chip.innerHTML = esc(t.name) + ' <span class="x" title="删除模板" role="button" aria-label="删除模板"><i class="fa-solid fa-xmark fa-only" aria-hidden="true"></i><span class="fa-fallback">✕</span></span>';
    chip.addEventListener('click', async e=>{
      if(e.target.closest('.x')){
        if(await showConfirm('删除模板', '确认删除模板「' + t.name + '」？')){
          await dbDel('templates', t.id); renderTemplates();
        }
        return;
      }
      // 生成可再编辑的待确认记录（无需拍照）
      state.parsed = {
        dish: t.name,
        ingredients: t.ingredients.map(g=>({...g, manualLevel:false}))
      };
      state.mealType = null; state.mealTypeManual = false; // 按当前时间重新推断餐次
      state.mealLevel = null; state.mealLevelManual = false; // 按模板食材重新评估整餐级别
      $('mealTimeInput').value = dtLocalVal(Date.now());
      renderConfirm();
      $('confirmCard').scrollIntoView({behavior:'smooth'});
      toast('已载入模板，可编辑后保存');
    });
    box.appendChild(chip);
  });
}

/* ==================================================================
 * 心情记录：分段仪表条（1-10，仿 Bearable 电量式打分），每天可记多条
 * ================================================================== */
let moodScore = 7;
function renderMood(){
  const f = moodFace(moodScore), t = moodTier(moodScore);
  $('moodFace').innerHTML =
    '<span class="mf-ico" style="color:' + t.seg + '">' + symIcon(f.i, f.t) + '</span>' +
    '<span class="mf-val" style="color:' + t.fg + '">' + moodScore + '/10</span>' +
    '<span class="mf-t">' + f.t + '</span>';
  const g = $('moodGauge');
  g.innerHTML = '';
  for(let i = 1; i <= 10; i++){
    const seg = document.createElement('button');
    seg.type = 'button';
    seg.className = 'mood-seg';
    if(i <= moodScore) seg.style.background = t.seg; // 已填充段取当前档位色
    seg.setAttribute('aria-label', i + ' 分');
    seg.addEventListener('click', ()=>{ moodScore = i; renderMood(); });
    g.appendChild(seg);
  }
}

/* ==================================================================
 * 症状记录：chips + 滑块，两步完成；选「无症状」时隐藏严重度（severity=0）
 * ================================================================== */
let selSym = null;
function renderSymChips(){
  const box = $('symChips');
  box.innerHTML = '';
  SYM_TYPES.forEach(s=>{
    const b = document.createElement('button');
    b.innerHTML = symIcon(s.i, s.t) + ' ' + s.t;
    b.className = selSym === s.t ? 'sel' : '';
    b.addEventListener('click', ()=>{ selSym = s.t; renderSymChips(); });
    box.appendChild(b);
  });
  const cur = SYM_TYPES.find(s=> s.t === selSym);
  $('sevRow').style.display = cur && cur.none ? 'none' : '';
}

/* ==================================================================
 * 事件绑定与初始化
 * ================================================================== */
export function initRecord(switchTab){
  switchTabFn = switchTab;
  $('photoInput').addEventListener('change', onPhotoPicked);
  $('galleryInput').addEventListener('change', onPhotoPicked);
  $('analyzeBtn').addEventListener('click', analyze);

  $('addIngBtn').addEventListener('click', ()=>{
    const name = $('addIngInput').value.trim();
    if(!name || !state.parsed) return;
    state.parsed.ingredients.push({name, amount:'中等', inferred:false, fodmap: fodmapLevel(name), manualLevel:false});
    $('addIngInput').value = '';
    renderIngList();
  });
  $('dishInput').addEventListener('input', ()=>{ if(state.parsed) state.parsed.dish = $('dishInput').value; });
  // 整餐色块：点按循环 低→中→高，手动确认后不再被自动评估覆盖
  $('mealLevelChip').addEventListener('click', ()=>{
    if(!state.parsed) return;
    const order = ['low','medium','high'];
    state.mealLevel = order[(order.indexOf(state.mealLevel)+1) % order.length];
    state.mealLevelManual = true;
    updateMealEval();
  });
  $('mealLevelAuto').addEventListener('click', ()=>{
    state.mealLevelManual = false;
    updateMealEval();
  });
  // 用餐时间变化时，若用户未手动选过餐次则自动跟随推断
  $('mealTimeInput').addEventListener('change', ()=>{
    if(state.parsed && !state.mealTypeManual){
      const t = new Date($('mealTimeInput').value).getTime();
      if(!isNaN(t)){ state.mealType = deriveMealType(t); renderMtypeChips(); }
    }
  });

  /* 保存饮食记录 → IndexedDB，并询问是否存为模板 */
  $('saveMealBtn').addEventListener('click', async ()=>{
    if(!state.parsed) return;
    const dish = $('dishInput').value.trim() || '未命名';
    if(!state.parsed.ingredients.length){ toast('食材列表为空'); return; }
    const tVal = $('mealTimeInput').value;
    const time = tVal ? new Date(tVal).getTime() : Date.now();
    const ingredients = state.parsed.ingredients.map(g=>({
      name: g.name, amount: g.amount, inferred: g.inferred, fodmap: g.fodmap
    }));
    // 整餐评估：级别×含量 加权评分 + 手动确认级别（决定时间线/统计颜色）
    const score = evalMealScore(ingredients);
    const level = (state.mealLevelManual && state.mealLevel) ? state.mealLevel : mealLevelFromScore(score);
    await dbAdd('meals', {
      time, dishName: dish, note: $('noteInput').value.trim(),
      mealType: state.mealType || deriveMealType(time),
      ingredients, score, level, levelManual: !!state.mealLevelManual,
      thumbnail: state.thumb
    });
    // 询问存为模板
    if(await showConfirm('已保存！', '要把「' + dish + '」存为模板吗？以后可一键记录同款。')){
      const tname = await showPrompt('存为模板', '模板名称：', dish);
      if(tname){
        await dbAdd('templates', {name: tname, ingredients});
        renderTemplates();
      }
    }
    // 重置记录区
    state.parsed = null; state.photo = null; state.thumb = null;
    state.mealType = null; state.mealTypeManual = false;
    state.mealLevel = null; state.mealLevelManual = false;
    $('confirmCard').style.display = 'none';
    $('noteInput').value = '';
    $('mealTimeInput').value = '';
    renderPhotoPicker();
    toast('饮食记录已保存');
  });

  $('sevSlider').addEventListener('input', ()=> $('sevVal').textContent = $('sevSlider').value + '/10');
  $('saveSymBtn').addEventListener('click', async ()=>{
    if(!selSym){ toast('请先选择症状'); return; }
    const cur = SYM_TYPES.find(s=> s.t === selSym);
    const none = !!(cur && cur.none);
    await dbAdd('symptoms', {
      time: Date.now(), type: selSym,
      severity: none ? 0 : parseInt($('sevSlider').value, 10),
      note: $('symNote').value.trim()
    });
    selSym = null; $('symNote').value = ''; $('sevSlider').value = 5; $('sevVal').textContent = '5/10';
    renderSymChips();
    toast(none ? '已标记：今日无症状' : '症状已记录');
  });

  $('saveMoodBtn').addEventListener('click', async ()=>{
    await dbAdd('moods', {time: Date.now(), score: moodScore, note: $('moodNote').value.trim()});
    $('moodNote').value = '';
    toast('心情已记录 ' + moodScore + '/10');
  });

  renderTemplates();
  renderSymChips();
  renderMood();
  renderPhotoPicker();
  $('mealTimeInput').value = dtLocalVal(Date.now());
}
