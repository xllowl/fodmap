/* ==================================================================
 * 本地存储层：自定义食材级别 / 已排除食材 / 餐次折叠状态 / 设置
 * （均存 localStorage，纯函数便于测试）
 * ================================================================== */
import { FODMAP_DB } from './data.js';

/* ---- 用户自定义食材级别：手动定级/AI 定级/批量调整 后自动记忆，查表优先级最高 ---- */
const CUSTOM_KEY = 'fodmap_custom';
export function loadCustom(){
  try{ return JSON.parse(localStorage.getItem(CUSTOM_KEY)) || {}; }catch(e){ return {}; }
}
export function saveCustomLevel(name, level){
  const c = loadCustom();
  c[(name||'').trim()] = level;
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(c));
}

/* 查表顺序：用户自定义表 → 内置表 name → 内置表 alias，查不到返回 null */
export function lookupFodmap(name){
  const n = (name||'').trim();
  if(!n) return null;
  const c = loadCustom();
  if(c[n]) return {name: n, alias: [], cat: '自定义', level: c[n], custom: true};
  let hit = FODMAP_DB.find(e => e.name === n);
  if(!hit) hit = FODMAP_DB.find(e => e.alias && e.alias.includes(n));
  return hit || null;
}
export function fodmapLevel(name){ const h = lookupFodmap(name); return h ? h.level : 'unknown'; }
/* 归一化名称（别名 → 正名），用于统计聚合 */
export function canonName(name){ const h = lookupFodmap(name); return h ? h.name : (name||'').trim(); }

/* ---- 触发分析「已排除食材」集合：左滑排除后收纳至独立模块 ---- */
const EXCLUDED_KEY = 'fodmap_excluded';
export function loadExcluded(){
  try{ return JSON.parse(localStorage.getItem(EXCLUDED_KEY)) || []; }catch(e){ return []; }
}
export function setExcluded(name, flag){
  let arr = loadExcluded();
  if(flag && !arr.includes(name)) arr.push(name);
  if(!flag) arr = arr.filter(x=>x !== name);
  localStorage.setItem(EXCLUDED_KEY, JSON.stringify(arr));
}

/* ---- 时间线餐次折叠状态（按 meal id 记忆，重渲染后保持） ---- */
const COLLAPSE_KEY = 'fodmap_collapsed';
function loadCollapsed(){
  try{ return JSON.parse(localStorage.getItem(COLLAPSE_KEY)) || []; }catch(e){ return []; }
}
export function isMealCollapsed(id){ return loadCollapsed().includes(id); }
export function setMealCollapsed(id, flag){
  let arr = loadCollapsed();
  if(flag && !arr.includes(id)) arr.push(id);
  if(!flag) arr = arr.filter(x=>x !== id);
  localStorage.setItem(COLLAPSE_KEY, JSON.stringify(arr));
}

/* ---- 设置（API 配置） ---- */
const SET_KEY = 'fodmap_settings';
export const DEFAULT_BASE_URL = 'https://api.openai.com/v1/chat/completions';
export function loadSettings(){
  let s = {};
  try{ s = JSON.parse(localStorage.getItem(SET_KEY)) || {}; }catch(e){}
  return { baseUrl: s.baseUrl || DEFAULT_BASE_URL, apiKey: s.apiKey || '', model: s.model || 'gpt-4o' };
}
export function saveSettings(s){ localStorage.setItem(SET_KEY, JSON.stringify(s)); }
