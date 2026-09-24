/* ==================================================================
 * 菜品区域检测与裁剪：把一张整餐照片拆成若干单菜品小图
 * 流程：LLM 边界框检测（DETECT_PROMPT）→ 本地 canvas 裁剪
 * 检测失败 / 未检出多区域时返回 null，由调用方降级为整图单次识别
 * ================================================================== */
import { DETECT_PROMPT } from './data.js';

/* ---------- 通用 LLM 调用（OpenAI 兼容 chat completions） ---------- */
/* 与 record.js 的识别调用保持同一协议；settings 来自 store.loadSettings() */
async function chatOnce(s, messages, temperature){
  const resp = await fetch(s.baseUrl, {
    method:'POST',
    headers:{ 'Content-Type':'application/json', 'Authorization':'Bearer ' + s.apiKey },
    body: JSON.stringify({ model: s.model, messages, temperature })
  });
  if(!resp.ok){
    const t = await resp.text().catch(()=> '');
    throw new Error('API 返回 ' + resp.status + '：' + t.slice(0, 150));
  }
  const data = await resp.json();
  return data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content || null;
}

/* 容错 JSON 提取：剥 ```json 包裹，截取第一个 [ 到最后一个 ] */
function parseJsonArray(text){
  const t = String(text||'').replace(/```(?:json)?/gi, '');
  const i = t.indexOf('['), j = t.lastIndexOf(']');
  if(i < 0 || j <= i) return null;
  try{
    const arr = JSON.parse(t.slice(i, j+1));
    return Array.isArray(arr) ? arr : null;
  }catch(e){ return null; }
}

/* ---------- 边界框几何工具 ---------- */
/* 交并比：用于去重重叠框 */
function iou(a, b){
  const x1 = Math.max(a[0], b[0]), y1 = Math.max(a[1], b[1]);
  const x2 = Math.min(a[0]+a[2], b[0]+b[2]), y2 = Math.min(a[1]+a[3], b[1]+b[3]);
  const inter = Math.max(0, x2-x1) * Math.max(0, y2-y1);
  if(inter <= 0) return 0;
  const u = a[2]*a[3] + b[2]*b[3] - inter;
  return u > 0 ? inter / u : 0;
}

/* 校验 + 归一化单个检测结果：box 由 0-1000 相对坐标归一化到 0-1 */
function normRegion(r){
  if(!r || !Array.isArray(r.box) || r.box.length !== 4) return null;
  let [x, y, w, h] = r.box.map(v=> Number(v));
  if([x, y, w, h].some(v=> !isFinite(v))) return null;
  x /= 1000; y /= 1000; w /= 1000; h /= 1000;
  // 越界修正
  x = Math.max(0, Math.min(1, x)); y = Math.max(0, Math.min(1, y));
  w = Math.max(0, Math.min(1 - x, w)); h = Math.max(0, Math.min(1 - y, h));
  // 过小的框（<2% 面积）视为噪声丢弃
  if(w * h < 0.02) return null;
  const name = String(r.label || r.name || '').trim().slice(0, 12) || '未识别菜品';
  return {name, box: [x, y, w, h]};
}

/* ---------- 对外：检测整餐照片中的菜品区域 ---------- */
/* 返回 [{name, box:[x,y,w,h](0-1)}]（最多 8 个，按面积降序去重）；
 * 未检出 / 解析失败 / 网络异常 → null（调用方降级整图识别） */
export async function detectDishes(fullBase64, settings){
  let content;
  try{
    content = await chatOnce(settings, [
      {role:'system', content: DETECT_PROMPT},
      {role:'user',   content: [
        {type:'image_url', image_url:{url: fullBase64}},
        {type:'text', text:'请检测这张照片中的所有菜品区域。'}
      ]}
    ], 0);
  }catch(e){ return null; }
  const arr = parseJsonArray(content);
  if(!arr || !arr.length) return null;

  let regions = arr.map(normRegion).filter(Boolean);
  // IoU>0.7 的重叠框只保留面积更大者（模型偶发重复输出）
  regions.sort((a,b)=> (b.box[2]*b.box[3]) - (a.box[2]*a.box[3]));
  const kept = [];
  regions.forEach(r=>{ if(!kept.some(k=> iou(k.box, r.box) > 0.7)) kept.push(r); });
  // 阅读顺序输出：先按 y（上下）再按 x（左右）
  kept.sort((a,b)=> (Math.abs(a.box[1]-b.box[1]) < 0.1) ? a.box[0]-b.box[0] : a.box[1]-b.box[1]);
  return kept.slice(0, 8);
}

/* ---------- 对外：按边界框裁剪出单菜品小图 ---------- */
/* src: base64 图；box: 归一化 [x,y,w,h]；pad: 四周外扩比例（保留菜品边缘配菜）
 * max: 最长边像素；返回 JPEG base64 */
export function cropByBox(src, box, {pad = 0.04, max = 800, q = 0.72} = {}){
  return new Promise((res, rej)=>{
    const img = new Image();
    img.onload = ()=>{
      const W = img.width, H = img.height;
      let [x, y, w, h] = box;
      const px = w * pad, py = h * pad;
      x = Math.max(0, x - px); y = Math.max(0, y - py);
      w = Math.min(1 - x, w + 2*px); h = Math.min(1 - y, h + 2*py);
      // 过小目标（裁剪后 <120px）适度放大裁剪范围，保留周围上下文
      const tooSmall = Math.min(w * W, h * H) < 120;
      if(tooSmall){
        const cx = x + w/2, cy = y + h/2;
        const side = 120 / Math.min(W, H);
        x = Math.max(0, cx - side/2); y = Math.max(0, cy - side/2);
        w = Math.min(1 - x, side); h = Math.min(1 - y, side);
      }
      const sc = Math.min(1, max / Math.max(w * W, h * H));
      const c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(w * W * sc));
      c.height = Math.max(1, Math.round(h * H * sc));
      c.getContext('2d').drawImage(img, x*W, y*H, w*W, h*H, 0, 0, c.width, c.height);
      res(c.toDataURL('image/jpeg', q));
    };
    img.onerror = ()=> rej(new Error('图片加载失败'));
    img.src = src;
  });
}
