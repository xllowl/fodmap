/* ==================================================================
 * Tab4 我的：API 设置 / 数据管理 / FODMAP 批量调整
 * ================================================================== */
import { LEVEL_TEXT, LEVEL_EMOJI, LVL_CYCLE, AMT_SHORT,
         MEAL_TYPE_MAP, mealTypeOf,
         evalMealScore, mealLevelFromScore, mealLevelOf, mealScoreOf } from './data.js';
import { $, esc, dayKey, hm, toast, showConfirm, download } from './util.js';
import { dbAll, dbPut, dbClear } from './db.js';
import { loadCustom, saveCustomLevel, canonName, fodmapLevel,
         loadSettings, saveSettings, DEFAULT_BASE_URL } from './store.js';
import { renderTemplates, applyLevelToPending } from './record.js';
import { renderTimeline } from './timeline.js';
import { renderStats } from './stats.js';

/* ==================================================================
 * API 设置
 * ================================================================== */
function renderSettings(){
  const s = loadSettings();
  $('setBaseUrl').value = s.baseUrl;
  $('setApiKey').value = s.apiKey;
  $('setModel').value = s.model;
}

/* ==================================================================
 * Markdown 导出（Obsidian 用，单文件按天分节）
 * ================================================================== */
async function exportMarkdown(){
  const meals = await dbAll('meals');
  const symps = await dbAll('symptoms');
  const moods = await dbAll('moods');
  if(!meals.length && !symps.length && !moods.length){ toast('暂无数据可导出'); return; }
  const items = meals.map(m=>({...m,_kind:'meal'}))
    .concat(symps.map(s=>({...s,_kind:'sym'})))
    .concat(moods.map(m=>({...m,_kind:'mood'})))
    .sort((a,b)=> a.time - b.time); // 每天内部按时间正序
  const days = {};
  items.forEach(it=>{ (days[dayKey(it.time)] = days[dayKey(it.time)] || []).push(it); });
  let md = '';
  Object.keys(days).sort().forEach(dk=>{
    md += '# ' + dk + '\n';
    const ms = days[dk].filter(x=>x._kind==='meal');
    const ss = days[dk].filter(x=>x._kind==='sym');
    const ds = days[dk].filter(x=>x._kind==='mood');
    if(ms.length){
      md += '## 饮食\n';
      ms.forEach(m=>{
        const mt = MEAL_TYPE_MAP[mealTypeOf(m)];
        md += '- ' + hm(m.time) + ' [' + mt.t + '] ' + m.dishName + ' ' + LEVEL_EMOJI[mealLevelOf(m)] + '(评分' + mealScoreOf(m) + ')\n';
        md += '  - ' + m.ingredients.map(g=>
          g.name + (g.inferred ? '[推测]' : '') + '(' + (AMT_SHORT[g.amount]||'中') + LEVEL_EMOJI[g.fodmap] + ')'
        ).join(' ') + '\n';
        if(m.note) md += '  - 备注：' + m.note + '\n';
      });
    }
    if(ss.length){
      md += '## 症状\n';
      ss.forEach(s=>{
        md += '- ' + hm(s.time) + ' ' + s.type + (s.severity > 0 ? ' ' + s.severity + '/10' : '') + (s.note ? '（' + s.note + '）' : '') + '\n';
      });
    }
    if(ds.length){
      md += '## 心情\n';
      ds.forEach(m=>{
        md += '- ' + hm(m.time) + ' 心情 ' + m.score + '/10' + (m.note ? '（' + m.note + '）' : '') + '\n';
      });
    }
    md += '\n';
  });
  download('fodmap-' + dayKey(Date.now()) + '.md', md, 'text/markdown;charset=utf-8');
  toast('Markdown 已导出');
}

/* ==================================================================
 * FODMAP 批量调整
 * 统一修改全局食材级别：写入自定义表（查表优先级最高），
 * 并同步重写全部历史餐次/模板中的对应级别与整餐评分，
 * 最后实时重绘时间线与统计分析，保证数据一致性。
 * ================================================================== */
const baSelected = new Set(); // 当前勾选的食材名

async function applyLevelToFoods(names, level){
  const nameSet = new Set(names);
  names.forEach(n=> saveCustomLevel(n, level));
  // 同步全部历史餐次（按原名或归一化名匹配）
  const meals = await dbAll('meals');
  let touched = 0;
  for(const m of meals){
    let ch = false;
    (m.ingredients||[]).forEach(g=>{
      if(nameSet.has(g.name) || nameSet.has(canonName(g.name))){ g.fodmap = level; ch = true; }
    });
    if(ch){
      // 重新评估整餐评分与级别；用户手动确认过颜色的餐次保留其级别
      m.score = evalMealScore(m.ingredients);
      if(!m.levelManual) m.level = mealLevelFromScore(m.score);
      await dbPut('meals', m);
      touched++;
    }
  }
  // 同步模板
  const tpls = await dbAll('templates');
  for(const t of tpls){
    let ch = false;
    (t.ingredients||[]).forEach(g=>{
      if(nameSet.has(g.name) || nameSet.has(canonName(g.name))){ g.fodmap = level; ch = true; }
    });
    if(ch) await dbPut('templates', t);
  }
  // 同步记录页待保存的确认列表
  applyLevelToPending(names, level);
  // 实时刷新所有关联统计与报告
  renderTimeline();
  renderStats();
  return touched;
}

function updateBaInfo(){
  $('baSelInfo').textContent = '已选 ' + baSelected.size + ' 项';
}

export async function renderBatchPanel(){
  const box = $('baList');
  if(!box) return;
  // 聚合全部已添加食物：历史餐次出现过的（含次数）+ 自定义表中手动定级过的
  const meals = await dbAll('meals');
  const count = {};
  meals.forEach(m=> (m.ingredients||[]).forEach(g=>{
    const n = canonName(g.name);
    count[n] = (count[n]||0) + 1;
  }));
  Object.keys(loadCustom()).forEach(n=>{ if(!(n in count)) count[n] = 0; });
  const names = Object.keys(count).sort((a,b)=> count[b]-count[a] || a.localeCompare(b, 'zh-Hans-CN'));

  baSelected.clear();
  updateBaInfo();
  $('baAll').checked = false;
  box.innerHTML = '';
  if(!names.length){ box.innerHTML = '<div class="empty-tip">暂无已记录的食材</div>'; return; }

  names.forEach(n=>{
    const row = document.createElement('div');
    row.className = 'ba-row';
    row.innerHTML =
      '<input type="checkbox" class="ba-check" aria-label="选择 ' + esc(n) + '">' +
      '<button class="dot dot-' + fodmapLevel(n) + '" data-act="lvl" title="点按单独切换级别"></button>' +
      '<span class="ba-name">' + esc(n) + '</span>' +
      (count[n] ? '<span class="ba-count">×' + count[n] + '</span>' : '<span class="ba-count">未使用</span>');
    const check = row.querySelector('.ba-check');
    check.addEventListener('change', ()=>{
      check.checked ? baSelected.add(n) : baSelected.delete(n);
      updateBaInfo();
    });
    // 单种食物单独修改：循环切换级别，立即生效并同步
    row.querySelector('[data-act=lvl]').addEventListener('click', async ()=>{
      const next = LVL_CYCLE[(LVL_CYCLE.indexOf(fodmapLevel(n))+1) % LVL_CYCLE.length];
      await applyLevelToFoods([n], next);
      toast('「' + n + '」已单独设为「' + LEVEL_TEXT[next] + '」');
      renderBatchPanel();
    });
    box.appendChild(row);
  });
}

/* ==================================================================
 * 事件绑定与初始化
 * ================================================================== */
export function initMe(){
  $('saveSetBtn').addEventListener('click', ()=>{
    saveSettings({
      baseUrl: $('setBaseUrl').value.trim() || DEFAULT_BASE_URL,
      apiKey: $('setApiKey').value.trim(),
      model: $('setModel').value.trim() || 'gpt-4o'
    });
    toast('设置已保存');
  });

  /* 导出 JSON 备份（四个 store 全量 + 自定义级别表） */
  $('expJsonBtn').addEventListener('click', async ()=>{
    const data = {
      version: 2, exportedAt: new Date().toISOString(),
      meals: await dbAll('meals'),
      symptoms: await dbAll('symptoms'),
      templates: await dbAll('templates'),
      moods: await dbAll('moods'),
      customLevels: loadCustom()
    };
    download('fodmap-backup-' + dayKey(Date.now()) + '.json', JSON.stringify(data, null, 2), 'application/json');
    toast('JSON 备份已导出');
  });

  /* 导入 JSON 恢复：清空后写入（保留原 id 以便去重） */
  $('impJsonBtn').addEventListener('click', ()=> $('impFileInput').click());
  $('impFileInput').addEventListener('change', e=>{
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = async ()=>{
      try{
        const data = JSON.parse(reader.result);
        if(!data || !Array.isArray(data.meals) || !Array.isArray(data.symptoms))
          throw new Error('文件格式不正确');
        if(!await showConfirm('导入确认', '导入将覆盖当前全部数据（共 ' + data.meals.length + ' 餐 / ' + data.symptoms.length + ' 症状），确认？')) return;
        await Promise.all([dbClear('meals'), dbClear('symptoms'), dbClear('templates'), dbClear('moods')]);
        for(const m of data.meals){ delete m._kind; await dbPut('meals', m); }
        for(const s of data.symptoms){ delete s._kind; await dbPut('symptoms', s); }
        for(const t of (data.templates || [])) await dbPut('templates', t);
        for(const m of (data.moods || [])){ delete m._kind; await dbPut('moods', m); }
        if(data.customLevels) localStorage.setItem('fodmap_custom', JSON.stringify(data.customLevels));
        renderTemplates();
        renderBatchPanel();
        toast('导入完成');
      }catch(err){ alert('导入失败：' + err.message); }
      e.target.value = '';
    };
    reader.readAsText(file);
  });

  $('expMdBtn').addEventListener('click', exportMarkdown);

  /* 清空数据（二次确认） */
  $('clearBtn').addEventListener('click', async ()=>{
    if(!await showConfirm('清空数据', '确认清空全部饮食/症状/模板数据？此操作不可恢复！')) return;
    if(!await showConfirm('二次确认', '真的要删除所有数据吗？')) return;
    await Promise.all([dbClear('meals'), dbClear('symptoms'), dbClear('templates'), dbClear('moods')]);
    renderTemplates();
    renderBatchPanel();
    toast('数据已清空');
  });

  /* ---- 批量调整面板：全选 / 批量设级 ---- */
  $('baAll').addEventListener('change', ()=>{
    const on = $('baAll').checked;
    baSelected.clear();
    document.querySelectorAll('#baList .ba-check').forEach(c=>{
      c.checked = on;
      if(on) baSelected.add(c.closest('.ba-row').querySelector('.ba-name').textContent);
    });
    updateBaInfo();
  });
  document.querySelectorAll('#baSet button[data-lv]').forEach(b=>{
    b.addEventListener('click', async ()=>{
      if(!baSelected.size){ toast('请先勾选要调整的食材'); return; }
      const lv = b.dataset.lv;
      const names = [...baSelected];
      if(!await showConfirm('批量调整',
        '将选中的 ' + names.length + ' 种食材统一设为「' + LEVEL_TEXT[lv] + '」？\n所有历史记录、统计与触发分析将实时同步更新。')) return;
      const touched = await applyLevelToFoods(names, lv);
      toast('已调整 ' + names.length + ' 种食材，同步更新 ' + touched + ' 条餐次记录');
      renderBatchPanel();
    });
  });

  renderSettings();
  renderBatchPanel();
}
