/* ==================================================================
 * 静态数据与常量（无 DOM 依赖，可独立测试）
 * ================================================================== */

/* FODMAP 本地数据库（JS 常量嵌入，离线可查）
 * 等级依据 Monash University 官方高低 FODMAP 清单及公开检测数据整理
 * level: high=高 medium=中 low=低 unknown=未知；分量敏感项统一 medium+备注 */
export const FODMAP_DB = [
  /* ============ 蔬菜 ============ */
  {name:"洋葱",alias:["圆葱"],cat:"蔬菜",level:"high"},
  {name:"大蒜",alias:["蒜","蒜头"],cat:"蔬菜",level:"high"},
  {name:"葱白",alias:["大葱"],cat:"蔬菜",level:"high"},
  {name:"葱绿",alias:[],cat:"蔬菜",level:"low",note:"替代葱白"},
  {name:"韭葱",alias:["青蒜"],cat:"蔬菜",level:"high",note:"Monash高"},
  {name:"韭菜",alias:[],cat:"蔬菜",level:"high"},
  {name:"蒜苔",alias:["蒜苗"],cat:"蔬菜",level:"high",note:"蒜类近亲"},
  {name:"香葱",alias:["小葱"],cat:"蔬菜",level:"medium",note:"葱绿低,葱白高"},
  {name:"芦笋",alias:[],cat:"蔬菜",level:"high"},
  {name:"朝鲜蓟",alias:["洋蓟"],cat:"蔬菜",level:"high",note:"Monash高"},
  {name:"豌豆",alias:["青豆"],cat:"蔬菜",level:"high",note:"Monash高(GOS)"},
  {name:"荷兰豆",alias:["雪豆"],cat:"蔬菜",level:"medium",note:"≤75g低"},
  {name:"菜花",alias:["花菜"],cat:"蔬菜",level:"high"},
  {name:"香菇",alias:["口蘑","金针菇","蘑菇"],cat:"蔬菜",level:"high",note:"平菇除外"},
  {name:"平菇",alias:[],cat:"蔬菜",level:"low"},
  {name:"芹菜",alias:[],cat:"蔬菜",level:"medium",note:"调味量OK,整根吃高"},
  {name:"西兰花",alias:[],cat:"蔬菜",level:"medium",note:"≤75g低"},
  {name:"红彩椒",alias:["红甜椒"],cat:"蔬菜",level:"high",note:"Monash高;绿彩椒低"},
  {name:"绿彩椒",alias:["青椒","甜椒","柿子椒"],cat:"蔬菜",level:"low",note:"Monash低"},
  {name:"玉米",alias:["甜玉米","玉米粒"],cat:"蔬菜",level:"medium",note:"半根内低,整根偏高"},
  {name:"南瓜",alias:["贝贝南瓜","老南瓜"],cat:"蔬菜",level:"medium",note:"≤1/3杯低,量大中"},
  {name:"秋葵",alias:[],cat:"蔬菜",level:"medium",note:"≤75g低"},
  {name:"西葫芦",alias:["角瓜","云南小瓜"],cat:"蔬菜",level:"medium",note:"≤65g低,量大含山梨醇"},
  {name:"甜菜根",alias:["红菜头"],cat:"蔬菜",level:"medium",note:"≤2片低"},
  {name:"茴香",alias:["茴香球茎"],cat:"蔬菜",level:"medium",note:"≤半杯低"},
  {name:"莲藕",alias:[],cat:"蔬菜",level:"medium",note:"数据有限,少量大概率可"},
  {name:"芋头",alias:[],cat:"蔬菜",level:"low",note:"≤半杯"},
  {name:"山药",alias:["淮山"],cat:"蔬菜",level:"unknown",note:"数据有限,自测"},
  {name:"红薯",alias:["地瓜"],cat:"蔬菜",level:"medium",note:"≤半个低"},
  {name:"胡萝卜",alias:[],cat:"蔬菜",level:"low"},
  {name:"黄瓜",alias:[],cat:"蔬菜",level:"low"},
  {name:"番茄",alias:["西红柿"],cat:"蔬菜",level:"low"},
  {name:"土豆",alias:["马铃薯"],cat:"蔬菜",level:"low"},
  {name:"茄子",alias:[],cat:"蔬菜",level:"low"},
  {name:"白菜",alias:["大白菜","小白菜","青菜"],cat:"蔬菜",level:"low"},
  {name:"卷心菜",alias:["包菜","圆白菜","高丽菜"],cat:"蔬菜",level:"low"},
  {name:"紫甘蓝",alias:[],cat:"蔬菜",level:"low"},
  {name:"羽衣甘蓝",alias:["甘蓝菜"],cat:"蔬菜",level:"low"},
  {name:"菠菜",alias:[],cat:"蔬菜",level:"low"},
  {name:"生菜",alias:[],cat:"蔬菜",level:"low"},
  {name:"芥蓝",alias:["芥兰"],cat:"蔬菜",level:"low"},
  {name:"油麦菜",alias:[],cat:"蔬菜",level:"low"},
  {name:"茼蒿",alias:["蒿子秆"],cat:"蔬菜",level:"low"},
  {name:"空心菜",alias:["通菜","蕹菜"],cat:"蔬菜",level:"low"},
  {name:"苋菜",alias:[],cat:"蔬菜",level:"low"},
  {name:"丝瓜",alias:[],cat:"蔬菜",level:"low"},
  {name:"冬瓜",alias:[],cat:"蔬菜",level:"low"},
  {name:"苦瓜",alias:[],cat:"蔬菜",level:"low"},
  {name:"白萝卜",alias:[],cat:"蔬菜",level:"low"},
  {name:"竹笋",alias:[],cat:"蔬菜",level:"low"},
  {name:"香菜",alias:["芫荽"],cat:"蔬菜",level:"low"},
  /* ============ 水果 ============ */
  {name:"苹果",alias:[],cat:"水果",level:"high"},
  {name:"梨",alias:[],cat:"水果",level:"high"},
  {name:"西瓜",alias:[],cat:"水果",level:"high"},
  {name:"芒果",alias:[],cat:"水果",level:"high"},
  {name:"桃",alias:["油桃"],cat:"水果",level:"high"},
  {name:"柿子",alias:[],cat:"水果",level:"high"},
  {name:"红枣",alias:["葡萄干"],cat:"水果",level:"high"},
  {name:"樱桃",alias:["车厘子"],cat:"水果",level:"high",note:"Monash高"},
  {name:"李子",alias:["西梅","布林"],cat:"水果",level:"high",note:"山梨醇"},
  {name:"无花果",alias:[],cat:"水果",level:"high"},
  {name:"荔枝",alias:[],cat:"水果",level:"high",note:"果糖+山梨醇"},
  {name:"椰枣",alias:[],cat:"水果",level:"high"},
  {name:"香蕉",alias:[],cat:"水果",level:"medium",note:"刚熟低,过熟长斑高"},
  {name:"牛油果",alias:[],cat:"水果",level:"medium",note:"1/8个低"},
  {name:"杏",alias:[],cat:"水果",level:"medium",note:"少量(1个)低"},
  {name:"龙眼",alias:["桂圆"],cat:"水果",level:"medium",note:"参考荔枝,少量"},
  {name:"石榴",alias:[],cat:"水果",level:"medium",note:"少量低"},
  {name:"榴莲",alias:[],cat:"水果",level:"medium",note:"≤30g低"},
  {name:"蔓越莓干",alias:[],cat:"水果",level:"medium",note:"≤1勺低"},
  {name:"椰肉",alias:["椰蓉"],cat:"水果",level:"medium",note:"新鲜少量低,椰蓉干偏高"},
  {name:"蓝莓",alias:[],cat:"水果",level:"low",note:"Monash低"},
  {name:"哈密瓜",alias:["甜瓜","香瓜","网纹瓜"],cat:"水果",level:"low",note:"Monash低"},
  {name:"木瓜",alias:["番木瓜"],cat:"水果",level:"low"},
  {name:"百香果",alias:[],cat:"水果",level:"low"},
  {name:"橙子",alias:["橘子"],cat:"水果",level:"low"},
  {name:"柚子",alias:["文旦"],cat:"水果",level:"low"},
  {name:"西柚",alias:["葡萄柚"],cat:"水果",level:"low",note:"适量"},
  {name:"柠檬",alias:["青柠"],cat:"水果",level:"low"},
  {name:"葡萄",alias:[],cat:"水果",level:"low"},
  {name:"草莓",alias:[],cat:"水果",level:"low"},
  {name:"猕猴桃",alias:[],cat:"水果",level:"low"},
  {name:"火龙果",alias:[],cat:"水果",level:"low"},
  {name:"菠萝",alias:[],cat:"水果",level:"low"},
  /* ============ 肉蛋 ============ */
  {name:"猪肉",alias:[],cat:"肉蛋",level:"low"},
  {name:"牛肉",alias:[],cat:"肉蛋",level:"low"},
  {name:"鸡肉",alias:[],cat:"肉蛋",level:"low"},
  {name:"鸭肉",alias:[],cat:"肉蛋",level:"low"},
  {name:"羊肉",alias:[],cat:"肉蛋",level:"low"},
  {name:"鹅肉",alias:[],cat:"肉蛋",level:"low"},
  {name:"鱼虾",alias:["鱼","虾"],cat:"肉蛋",level:"low"},
  {name:"鸡蛋",alias:["蛋"],cat:"肉蛋",level:"low"},
  {name:"咸蛋",alias:[],cat:"肉蛋",level:"low"},
  {name:"皮蛋",alias:["松花蛋"],cat:"肉蛋",level:"low"},
  {name:"培根",alias:[],cat:"肉蛋",level:"low",note:"原味;留意蒜粉腌料"},
  {name:"火腿",alias:[],cat:"肉蛋",level:"medium",note:"加工肉常含蒜/洋葱,看配料"},
  {name:"香肠",alias:["烤肠","腊肠"],cat:"肉蛋",level:"medium",note:"常含蒜粉,看配料"},
  {name:"午餐肉",alias:[],cat:"肉蛋",level:"medium",note:"看配料"},
  {name:"肉松",alias:[],cat:"肉蛋",level:"medium",note:"常含蒜粉"},
  {name:"肉丸",alias:["贡丸","鱼丸"],cat:"肉蛋",level:"medium",note:"常含葱蒜"},
  /* ============ 豆制 ============ */
  {name:"老豆腐",alias:["北豆腐","豆干"],cat:"豆制",level:"low"},
  {name:"嫩豆腐",alias:["绢豆腐","内酯豆腐"],cat:"豆制",level:"high"},
  {name:"豆腐脑",alias:[],cat:"豆制",level:"high",note:"全豆制作"},
  {name:"天贝",alias:[],cat:"豆制",level:"low",note:"发酵大豆,Monash低"},
  {name:"腐竹",alias:[],cat:"豆制",level:"low",note:"大豆蛋白制品"},
  {name:"豆浆",alias:[],cat:"豆制",level:"medium",note:"全豆现磨偏高"},
  {name:"红豆",alias:["绿豆","芸豆"],cat:"豆制",level:"high"},
  {name:"黑豆",alias:["花豆"],cat:"豆制",level:"high",note:"煮熟高;罐装冲洗中"},
  {name:"鹰嘴豆",alias:[],cat:"豆制",level:"medium",note:"罐装冲洗≤1/4杯低,煮的高"},
  {name:"扁豆",alias:["小扁豆"],cat:"豆制",level:"medium",note:"罐装少量低,煮的高"},
  {name:"毛豆",alias:[],cat:"豆制",level:"medium",note:"≤90g低"},
  {name:"纳豆",alias:[],cat:"豆制",level:"medium",note:"全豆发酵"},
  /* ============ 主食 ============ */
  {name:"米饭",alias:["大米","粥"],cat:"主食",level:"low"},
  {name:"糙米",alias:["红米","黑米"],cat:"主食",level:"low"},
  {name:"小米",alias:[],cat:"主食",level:"low"},
  {name:"藜麦",alias:[],cat:"主食",level:"low"},
  {name:"荞麦",alias:["荞麦米"],cat:"主食",level:"low",note:"纯荞麦"},
  {name:"米粉",alias:["米线","河粉","粉丝"],cat:"主食",level:"low"},
  {name:"糯米",alias:[],cat:"主食",level:"low"},
  {name:"燕麦",alias:[],cat:"主食",level:"low"},
  {name:"玉米面",alias:["玉米糁","棒子面"],cat:"主食",level:"low"},
  {name:"酸面包",alias:["斯佩尔特酸面包","天然酵母面包"],cat:"主食",level:"low",note:"Monash认证2片内低"},
  {name:"米饼",alias:["糙米饼"],cat:"主食",level:"low"},
  {name:"玉米饼",alias:["墨西哥玉米饼"],cat:"主食",level:"low"},
  {name:"年糕",alias:[],cat:"主食",level:"low",note:"糯米制品"},
  {name:"汤圆",alias:[],cat:"主食",level:"low",note:"芝麻/花生馅可"},
  {name:"爆米花",alias:[],cat:"主食",level:"low",note:"原味"},
  {name:"荞麦面",alias:[],cat:"主食",level:"medium",note:"市售多掺小麦,看配料"},
  {name:"玉米片",alias:[],cat:"主食",level:"medium",note:"≤半杯低"},
  {name:"月饼",alias:[],cat:"主食",level:"medium",note:"小麦皮,少量"},
  {name:"面条",alias:["拉面","挂面"],cat:"主食",level:"high",note:"正常分量即高"},
  {name:"乌冬面",alias:[],cat:"主食",level:"high",note:"小麦"},
  {name:"意大利面",alias:["意面","通心粉"],cat:"主食",level:"high",note:"小麦,少量中"},
  {name:"馒头",alias:["花卷"],cat:"主食",level:"high"},
  {name:"包子皮",alias:["饺子皮","馄饨皮"],cat:"主食",level:"high"},
  {name:"面包",alias:[],cat:"主食",level:"high"},
  {name:"油条",alias:[],cat:"主食",level:"high"},
  {name:"饼干",alias:["苏打饼干","消化饼干"],cat:"主食",level:"high",note:"小麦+常含蜂蜜/奶粉"},
  /* ============ 乳制 ============ */
  {name:"牛奶",alias:[],cat:"乳制",level:"high"},
  {name:"奶茶",alias:[],cat:"乳制",level:"high"},
  {name:"酸奶",alias:[],cat:"乳制",level:"high",note:"乳糖;无乳糖酸奶另算"},
  {name:"冰淇淋",alias:["雪糕"],cat:"乳制",level:"high",note:"Monash高"},
  {name:"炼乳",alias:["淡奶"],cat:"乳制",level:"high",note:"Monash高"},
  {name:"奶粉",alias:[],cat:"乳制",level:"high",note:"乳糖浓缩"},
  {name:"卡仕达酱",alias:["蛋奶糊"],cat:"乳制",level:"high",note:"Monash高"},
  {name:"希腊酸奶",alias:[],cat:"乳制",level:"medium",note:"滤乳清后较低,≤2勺低"},
  {name:"奶油奶酪",alias:[],cat:"乳制",level:"medium",note:"≤40g低"},
  {name:"淡奶油",alias:["稀奶油","鲜奶油"],cat:"乳制",level:"medium",note:"≤2勺低"},
  {name:"酸奶油",alias:[],cat:"乳制",level:"medium",note:"≤2勺低"},
  {name:"燕麦奶",alias:[],cat:"乳制",level:"medium",note:"≤125ml低,大量高"},
  {name:"椰奶",alias:["椰浆"],cat:"乳制",level:"medium",note:"罐装≤60ml低"},
  {name:"无乳糖牛奶",alias:[],cat:"乳制",level:"low"},
  {name:"无乳糖酸奶",alias:[],cat:"乳制",level:"low"},
  {name:"黄油",alias:[],cat:"乳制",level:"low"},
  {name:"切达奶酪",alias:["车打","硬质奶酪"],cat:"乳制",level:"low",note:"几乎无乳糖"},
  {name:"马苏里拉",alias:[],cat:"乳制",level:"low",note:"低乳糖"},
  {name:"帕玛森",alias:["巴马臣"],cat:"乳制",level:"low"},
  {name:"布里奶酪",alias:["卡门贝尔"],cat:"乳制",level:"low",note:"Monash低乳糖"},
  {name:"菲达奶酪",alias:["羊奶酪"],cat:"乳制",level:"low"},
  {name:"杏仁奶",alias:[],cat:"乳制",level:"low",note:"Monash低"},
  {name:"米奶",alias:["大米奶"],cat:"乳制",level:"low"},
  /* ============ 坚果 ============ */
  {name:"腰果",alias:[],cat:"坚果",level:"high",note:"Monash高(GOS+果聚糖)"},
  {name:"开心果",alias:[],cat:"坚果",level:"high",note:"Monash高"},
  {name:"杏仁",alias:["巴旦木"],cat:"坚果",level:"medium",note:"≤10颗低,20颗以上高"},
  {name:"碧根果",alias:[],cat:"坚果",level:"medium",note:"≤10瓣低"},
  {name:"榛子",alias:[],cat:"坚果",level:"medium",note:"≤10颗低"},
  {name:"松子",alias:[],cat:"坚果",level:"medium",note:"≤1勺低"},
  {name:"葵花籽",alias:["瓜子"],cat:"坚果",level:"medium",note:"≤2勺低"},
  {name:"核桃",alias:[],cat:"坚果",level:"low",note:"Monash低"},
  {name:"花生",alias:[],cat:"坚果",level:"low",note:"Monash低"},
  {name:"夏威夷果",alias:["澳洲坚果"],cat:"坚果",level:"low",note:"Monash低"},
  {name:"南瓜子",alias:["白瓜子"],cat:"坚果",level:"low",note:"Monash低"},
  {name:"芝麻",alias:[],cat:"坚果",level:"low",note:"调味量"},
  {name:"奇亚籽",alias:[],cat:"坚果",level:"low",note:"≤2勺"},
  {name:"亚麻籽",alias:[],cat:"坚果",level:"low",note:"≤1勺"},
  {name:"花生酱",alias:[],cat:"坚果",level:"low",note:"无糖无蜂蜜款≤2勺"},
  /* ============ 饮料 ============ */
  {name:"苹果汁",alias:["梨汁","苹果梨汁"],cat:"饮料",level:"high"},
  {name:"葡萄汁",alias:[],cat:"饮料",level:"high"},
  {name:"可乐",alias:["汽水"],cat:"饮料",level:"medium",note:"蔗糖型少量可,果葡糖浆型避开"},
  {name:"橙汁",alias:[],cat:"饮料",level:"medium",note:"鲜榨≤125ml低"},
  {name:"椰子水",alias:[],cat:"饮料",level:"medium",note:"≤100ml低,大量高"},
  {name:"运动饮料",alias:[],cat:"饮料",level:"medium",note:"看糖浆类型"},
  {name:"啤酒",alias:[],cat:"饮料",level:"low",note:"≤1罐(375ml)"},
  {name:"葡萄酒",alias:["红酒"],cat:"饮料",level:"low",note:"≤150ml"},
  {name:"白酒",alias:["烈酒","威士忌","伏特加"],cat:"饮料",level:"low",note:"小酌"},
  {name:"绿茶",alias:["红茶","乌龙茶"],cat:"饮料",level:"low"},
  {name:"黑咖啡",alias:["美式","浓缩咖啡"],cat:"饮料",level:"low",note:"加奶看奶类"},
  /* ============ 甜味 ============ */
  {name:"果葡糖浆",alias:["高果糖玉米糖浆"],cat:"甜味",level:"high",note:"Monash高"},
  {name:"龙舌兰糖浆",alias:[],cat:"甜味",level:"high",note:"高果糖"},
  {name:"木糖醇",alias:[],cat:"甜味",level:"high",note:"多元醇"},
  {name:"山梨糖醇",alias:[],cat:"甜味",level:"high",note:"多元醇E420"},
  {name:"麦芽糖醇",alias:[],cat:"甜味",level:"high",note:"多元醇"},
  {name:"无糖口香糖",alias:["木糖醇口香糖"],cat:"甜味",level:"high",note:"木糖醇/山梨醇"},
  {name:"赤藓糖醇",alias:[],cat:"甜味",level:"medium",note:"耐受较好,大量仍腹胀"},
  {name:"白糖",alias:["红糖","冰糖","绵白糖"],cat:"甜味",level:"low"},
  {name:"枫糖浆",alias:[],cat:"甜味",level:"low",note:"Monash低"},
  {name:"大米糖浆",alias:["大米麦芽糖浆"],cat:"甜味",level:"low",note:"Monash低"},
  {name:"甜菊糖",alias:[],cat:"甜味",level:"low"},
  {name:"阿斯巴甜",alias:[],cat:"甜味",level:"low",note:"非FODMAP问题"},
  /* ============ 零食 ============ */
  {name:"牛奶巧克力",alias:[],cat:"零食",level:"medium",note:"≤20g低"},
  {name:"棉花糖",alias:[],cat:"零食",level:"medium",note:"少量"},
  {name:"薯片",alias:[],cat:"零食",level:"low",note:"原味;调味款看蒜粉"},
  {name:"黑巧克力",alias:[],cat:"零食",level:"low",note:"Monash低,≤30g"},
  {name:"海苔",alias:["即食紫菜"],cat:"零食",level:"low"},
  {name:"果冻",alias:[],cat:"零食",level:"low",note:"无糖款注意代糖"},
  /* ============ 调料 ============ */
  {name:"蒜油",alias:["葱油"],cat:"调料",level:"low",note:"FODMAP不溶于油,弃渣"},
  {name:"姜",alias:["生姜"],cat:"调料",level:"low"},
  {name:"酱油",alias:[],cat:"调料",level:"low"},
  {name:"醋",alias:[],cat:"调料",level:"low"},
  {name:"料酒",alias:[],cat:"调料",level:"low"},
  {name:"盐",alias:["味精","鸡精"],cat:"调料",level:"low"},
  {name:"蚝油",alias:[],cat:"调料",level:"low",note:"调味量"},
  {name:"鱼露",alias:[],cat:"调料",level:"low"},
  {name:"芥末",alias:["黄芥末","芥末酱"],cat:"调料",level:"low"},
  {name:"蛋黄酱",alias:["美乃滋","沙拉酱"],cat:"调料",level:"low",note:"Monash低;蒜味款避开"},
  {name:"烧烤酱",alias:[],cat:"调料",level:"low",note:"Monash低,仍建议看蒜粉"},
  {name:"芝麻酱",alias:[],cat:"调料",level:"low",note:"≤2勺"},
  {name:"味噌",alias:[],cat:"调料",level:"low",note:"≤2勺,发酵大豆"},
  {name:"五香粉",alias:["十三香","白胡椒","黑胡椒"],cat:"调料",level:"low"},
  {name:"橄榄油",alias:["花生油","椰子油","菜籽油"],cat:"调料",level:"low",note:"油脂无FODMAP"},
  {name:"辣椒",alias:[],cat:"调料",level:"low",note:"辣椒素另刺激肠道,单独追踪"},
  {name:"花椒",alias:["八角","桂皮","孜然"],cat:"调料",level:"low"},
  {name:"洋葱粉",alias:["大蒜粉"],cat:"调料",level:"high"},
  {name:"蜂蜜",alias:[],cat:"调料",level:"high"},
  {name:"浓汤宝",alias:["高汤块","火锅底料"],cat:"调料",level:"high",note:"含葱蒜"},
  {name:"蒜蓉辣酱",alias:[],cat:"调料",level:"high",note:"蒜基底"},
  {name:"韭菜花酱",alias:["韭花酱"],cat:"调料",level:"high"},
  {name:"泡菜",alias:["韩式泡菜"],cat:"调料",level:"high",note:"蒜+葱"},
  {name:"番茄酱",alias:[],cat:"调料",level:"medium",note:"少量可,部分含洋葱/果葡糖浆"},
  {name:"咖喱",alias:["咖喱粉","咖喱块"],cat:"调料",level:"medium",note:"常含洋葱蒜,看配料"},
  {name:"老干妈",alias:["风味豆豉"],cat:"调料",level:"medium",note:"含蒜,少量"},
  {name:"腐乳",alias:[],cat:"调料",level:"medium",note:"发酵,少量可"},
  {name:"酸菜",alias:["东北酸菜","德式酸菜"],cat:"调料",level:"medium",note:"≤1勺低,大量高"},
  {name:"甜面酱",alias:[],cat:"调料",level:"medium",note:"发酵小麦,少量可"},
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
/* 心情评分 → 三档配色（条段色 seg / 浅底 bg / 文字 fg），好档取 Bearable 青绿 */
export function moodTier(score){
  if(score <= 3) return {seg:'#E86A5A', bg:'#FBEBE8', fg:'#C0392B'};
  if(score <= 6) return {seg:'#E5B93E', bg:'#FBF4DC', fg:'#8A6D1A'};
  return              {seg:'#2BB39A', bg:'#E8F5EE', fg:'#1E7A4F'};
}

/* 布里斯托大便分类法（Bristol Stool Scale 1-7）
 * n 类型号 / t 短名 / d 说明 / c 色块 / bg+fg 徽标配色（红=需关注 黄=偏差 绿=正常） */
export const BRISTOL_TYPES = [
  {n:1, t:'硬块',   d:'分离的硬块，像坚果，难以排出（严重便秘）', c:'#E86A5A', bg:'#FBEBE8', fg:'#C0392B'},
  {n:2, t:'疙瘩状', d:'香肠状但表面疙瘩（轻度便秘）',             c:'#E5B93E', bg:'#FBF4DC', fg:'#8A6D1A'},
  {n:3, t:'裂纹状', d:'香肠状但表面有裂缝（正常）',               c:'#3BAF7C', bg:'#E8F5EE', fg:'#1E7A4F'},
  {n:4, t:'光滑状', d:'像香肠或蛇一样，光滑柔软（理想）',         c:'#2BB39A', bg:'#E8F5EE', fg:'#1E7A4F'},
  {n:5, t:'软团状', d:'柔软的团块，边缘清晰，易排出（纤维不足）', c:'#E5B93E', bg:'#FBF4DC', fg:'#8A6D1A'},
  {n:6, t:'糊状',   d:'蓬松的碎片状，边缘粗糙的糊状便（轻度腹泻）', c:'#E86A5A', bg:'#FBEBE8', fg:'#C0392B'},
  {n:7, t:'水样',   d:'完全水样，无固体碎片（严重腹泻）',         c:'#C0392B', bg:'#FBEBE8', fg:'#C0392B'}
];

/* 咖啡类型（快速记录用） */
export const COFFEE_TYPES = ['美式', '拿铁', '浓缩', '低因', '其他'];
/* 咖啡条目配色（时间线/徽标统一咖啡棕） */
export const COFFEE_COLOR = {c:'#8B5E34', bg:'#F5EDE4', fg:'#8B5E34'};

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
