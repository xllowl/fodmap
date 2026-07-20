/* ==================================================================
 * 静态数据与常量（无 DOM 依赖，可独立测试）
 * ================================================================== */

/* FODMAP 本地数据库（JS 常量嵌入，离线可查）
 * level: high=高 medium=中 low=低 unknown=未知 */
export const FODMAP_DB = [
  {name:"洋葱",alias:["圆葱"],cat:"蔬菜",level:"high"},
  {name:"大蒜",alias:["蒜","蒜头"],cat:"蔬菜",level:"high"},
  {name:"葱白",alias:["大葱"],cat:"蔬菜",level:"high"},
  {name:"葱绿",alias:[],cat:"蔬菜",level:"low",note:"替代葱白"},
  {name:"韭菜",alias:[],cat:"蔬菜",level:"high"},
  {name:"蒜油",alias:["葱油"],cat:"调料",level:"low",note:"FODMAP不溶于油,弃渣"},
  {name:"芦笋",alias:[],cat:"蔬菜",level:"high"},
  {name:"菜花",alias:["花菜"],cat:"蔬菜",level:"high"},
  {name:"香菇",alias:["口蘑","金针菇","蘑菇"],cat:"蔬菜",level:"high",note:"平菇除外"},
  {name:"平菇",alias:[],cat:"蔬菜",level:"low"},
  {name:"芹菜",alias:[],cat:"蔬菜",level:"medium",note:"调味量OK,整根吃高"},
  {name:"西兰花",alias:[],cat:"蔬菜",level:"medium",note:"≤75g低"},
  {name:"红薯",alias:["地瓜"],cat:"蔬菜",level:"medium",note:"≤半个低"},
  {name:"胡萝卜",alias:[],cat:"蔬菜",level:"low"},
  {name:"黄瓜",alias:[],cat:"蔬菜",level:"low"},
  {name:"番茄",alias:["西红柿"],cat:"蔬菜",level:"low"},
  {name:"土豆",alias:["马铃薯"],cat:"蔬菜",level:"low"},
  {name:"茄子",alias:[],cat:"蔬菜",level:"low"},
  {name:"白菜",alias:["大白菜","小白菜","青菜"],cat:"蔬菜",level:"low"},
  {name:"菠菜",alias:[],cat:"蔬菜",level:"low"},
  {name:"生菜",alias:[],cat:"蔬菜",level:"low"},
  {name:"白萝卜",alias:[],cat:"蔬菜",level:"low"},
  {name:"竹笋",alias:[],cat:"蔬菜",level:"low"},
  {name:"苹果",alias:[],cat:"水果",level:"high"},
  {name:"梨",alias:[],cat:"水果",level:"high"},
  {name:"西瓜",alias:[],cat:"水果",level:"high"},
  {name:"芒果",alias:[],cat:"水果",level:"high"},
  {name:"桃",alias:["油桃"],cat:"水果",level:"high"},
  {name:"柿子",alias:[],cat:"水果",level:"high"},
  {name:"红枣",alias:["葡萄干"],cat:"水果",level:"high"},
  {name:"香蕉",alias:[],cat:"水果",level:"medium",note:"刚熟低,过熟长斑高"},
  {name:"牛油果",alias:[],cat:"水果",level:"medium",note:"1/8个低"},
  {name:"橙子",alias:["橘子"],cat:"水果",level:"low"},
  {name:"葡萄",alias:[],cat:"水果",level:"low"},
  {name:"草莓",alias:[],cat:"水果",level:"low"},
  {name:"猕猴桃",alias:[],cat:"水果",level:"low"},
  {name:"火龙果",alias:[],cat:"水果",level:"low"},
  {name:"菠萝",alias:[],cat:"水果",level:"low"},
  {name:"猪肉",alias:[],cat:"肉蛋",level:"low"},
  {name:"牛肉",alias:[],cat:"肉蛋",level:"low"},
  {name:"鸡肉",alias:[],cat:"肉蛋",level:"low"},
  {name:"鱼虾",alias:["鱼","虾"],cat:"肉蛋",level:"low"},
  {name:"鸡蛋",alias:["蛋"],cat:"肉蛋",level:"low"},
  {name:"老豆腐",alias:["北豆腐","豆干"],cat:"豆制",level:"low"},
  {name:"嫩豆腐",alias:["绢豆腐","内酯豆腐"],cat:"豆制",level:"high"},
  {name:"豆浆",alias:[],cat:"豆制",level:"medium",note:"全豆现磨偏高"},
  {name:"红豆",alias:["绿豆","芸豆"],cat:"豆制",level:"high"},
  {name:"米饭",alias:["大米","粥"],cat:"主食",level:"low"},
  {name:"米粉",alias:["米线","河粉","粉丝"],cat:"主食",level:"low"},
  {name:"糯米",alias:[],cat:"主食",level:"low"},
  {name:"燕麦",alias:[],cat:"主食",level:"low"},
  {name:"面条",alias:["拉面","挂面"],cat:"主食",level:"high",note:"正常分量即高"},
  {name:"馒头",alias:["花卷"],cat:"主食",level:"high"},
  {name:"包子皮",alias:["饺子皮","馄饨皮"],cat:"主食",level:"high"},
  {name:"面包",alias:[],cat:"主食",level:"high"},
  {name:"油条",alias:[],cat:"主食",level:"high"},
  {name:"牛奶",alias:[],cat:"乳制",level:"high"},
  {name:"奶茶",alias:[],cat:"乳制",level:"high"},
  {name:"无乳糖牛奶",alias:[],cat:"乳制",level:"low"},
  {name:"黄油",alias:[],cat:"乳制",level:"low"},
  {name:"姜",alias:["生姜"],cat:"调料",level:"low"},
  {name:"酱油",alias:[],cat:"调料",level:"low"},
  {name:"醋",alias:[],cat:"调料",level:"low"},
  {name:"料酒",alias:[],cat:"调料",level:"low"},
  {name:"辣椒",alias:[],cat:"调料",level:"low",note:"辣椒素另刺激肠道,单独追踪"},
  {name:"花椒",alias:["八角","桂皮","孜然"],cat:"调料",level:"low"},
  {name:"蜂蜜",alias:[],cat:"调料",level:"high"},
  {name:"浓汤宝",alias:["高汤块","火锅底料"],cat:"调料",level:"high",note:"含葱蒜"},
  {name:"豆瓣酱",alias:[],cat:"调料",level:"unknown",note:"少量大概率可,实测"}
];

/* 大模型系统提示词（按需求原文） */
export const SYS_PROMPT = `你是IBS饮食记录助手。根据照片和备注，输出这餐的食材清单，用于FODMAP追踪。
要求：
1. 列出可见食材；并根据该菜式典型做法补充可能的隐形食材
   （葱/蒜/洋葱/高汤/酱料），标注 inferred:true
2. 每种食材估计量级：少量/中等/大量，不估克数
3. 只输出JSON，无其他文字：
   {"dish":"菜名","ingredients":[{"name":"食材","amount":"少量","inferred":false}]}
4. 食材用通用中文名（如"西红柿"→"番茄"），便于查表
5. 只做客观成分提取，不给任何饮食建议`;

/* 未知食材 FODMAP 定级的系统提示词：返回纯 JSON 数组 */
export const FODMAP_PROMPT = `你是 FODMAP 饮食法专家。用户会给你一组食材名（可能含中餐/加工食品）。
对每种食材给出其 FODMAP 级别（按常规食用量）：
high=高（如洋葱、大蒜、小麦、牛奶、苹果），medium=中，low=低（如米饭、胡萝卜、香蕉、鸡蛋、普通肉类）。
无法判断的填 unknown。复合食品按主要高风险成分定级。
严格只返回 JSON 数组，无任何其他文字、无 markdown 代码块：
[{"name":"食材名(与输入一致)","level":"high|medium|low|unknown","reason":"15字内理由"}]`;

/* FODMAP 级别 → 颜色/标签/数值权重 */
export const LEVEL_COLOR = {high:'#E86A5A',medium:'#E5B93E',low:'#3BAF7C',unknown:'#B8B0A0'};
export const LEVEL_EMOJI = {high:'🔴',medium:'🟡',low:'🟢',unknown:'⚪'}; // 仅用于 Markdown 导出（纯文本）
export const LEVEL_TEXT  = {high:'高',medium:'中',low:'低',unknown:'未知'};
export const LEVEL_ORDER = {unknown:0,low:1,medium:2,high:3};
export const AMT_SHORT   = {'少量':'少','中等':'中','大量':'大'};
export const AMT_CYCLE   = ['少量','中等','大量'];
export const LVL_CYCLE   = ['unknown','low','medium','high'];

/* 症状类型 → FontAwesome 图标；首项「无症状」为显式无症狀标记（severity=0，仿 Bearable 的 None） */
export const SYM_TYPES = [
  {t:'无症状', i:'fa-circle-check', none:true},
  {t:'腹痛', i:'fa-bolt'},          {t:'腹胀', i:'fa-circle-up'},
  {t:'腹泻', i:'fa-droplet'},       {t:'便秘', i:'fa-ban'},
  {t:'产气', i:'fa-wind'},          {t:'恶心', i:'fa-dizzy'}
];

/* 心情评分（1-10）→ 表情/文案（仿 Bearable 电量式打分） */
export function moodFace(score){
  if(score <= 2) return {i:'fa-face-tired',      t:'很痛苦'};
  if(score <= 4) return {i:'fa-face-frown',      t:'不太好'};
  if(score <= 6) return {i:'fa-face-meh',        t:'一般'};
  if(score <= 8) return {i:'fa-face-smile',      t:'不错'};
  return              {i:'fa-face-laugh-beam', t:'很好'};
}
/* 心情评分 → 三档配色（条段色 seg / 浅底 bg / 文字 fg） */
export function moodTier(score){
  if(score <= 3) return {seg:'#E86A5A', bg:'#FBEBE8', fg:'#C0392B'};
  if(score <= 6) return {seg:'#E5B93E', bg:'#FBF4DC', fg:'#8A6D1A'};
  return              {seg:'#3BAF7C', bg:'#E8F5EE', fg:'#1E7A4F'};
}

/* 用餐类型：正餐 3 餐 + 点心 */
export const MEAL_TYPES = [
  {k:'breakfast', t:'早餐', i:'fa-mug-saucer'},
  {k:'lunch',     t:'午餐', i:'fa-sun'},
  {k:'dinner',    t:'晚餐', i:'fa-moon'},
  {k:'snack',     t:'点心', i:'fa-cookie-bite'}
];
export const MEAL_TYPE_MAP = Object.fromEntries(MEAL_TYPES.map(t=>[t.k, t]));

/* 按用餐时间自动推断餐次：
 * 5-10 早餐，10-15 午餐，15-17 下午茶点心，17-22 晚餐，其余归点心 */
export function deriveMealType(ts){
  const h = new Date(ts).getHours();
  if(h >= 5  && h < 10) return 'breakfast';
  if(h >= 10 && h < 15) return 'lunch';
  if(h >= 15 && h < 17) return 'snack';
  if(h >= 17 && h < 22) return 'dinner';
  return 'snack';
}
/* 读取餐次类型：老数据无 mealType 字段时按时间推断 */
export function mealTypeOf(meal){
  return (meal.mealType && MEAL_TYPE_MAP[meal.mealType]) ? meal.mealType : deriveMealType(meal.time);
}

/* ==================================================================
 * 单餐 FODMAP 评估：不再只取最高级别，而是「级别 × 含量」加权累加评分
 * 级别权重：high=3 medium=2（low/unknown 不计入风险）
 * 量级权重：少量=1 中等=2 大量=3
 * ================================================================== */
export const AMT_WEIGHT = {'少量':1, '中等':2, '大量':3};
export function evalMealScore(ingredients){
  let s = 0;
  (ingredients || []).forEach(g=>{
    const lw = g.fodmap === 'high' ? 3 : g.fodmap === 'medium' ? 2 : 0;
    s += lw * (AMT_WEIGHT[g.amount] || 2);
  });
  return s;
}
/* 评分 → 整餐级别：0=低；1-4=中（如 1 种少量高风险 或 中量中风险）；≥5=高
 * （如 中量高风险 6、两种少量高风险叠加 6、大量中风险 6） */
export function mealLevelFromScore(score){
  if(score <= 0) return 'low';
  if(score <= 4) return 'medium';
  return 'high';
}
/* 读取整餐评分：优先取记录中的 score，老数据按食材现算 */
export function mealScoreOf(meal){
  return (meal && typeof meal.score === 'number') ? meal.score : evalMealScore(meal ? meal.ingredients : []);
}
/* 读取整餐级别（决定颜色）：手动确认过的 level 优先，否则按评分推导 */
export function mealLevelOf(meal){
  if(meal && ['high','medium','low','unknown'].includes(meal.level)) return meal.level;
  return mealLevelFromScore(mealScoreOf(meal));
}
