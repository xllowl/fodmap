/* ==================================================================
 * IndexedDB 封装
 * v2：+moods（心情）；v3：+bowels（排便）；v4：+coffees（咖啡）
 * v5：+waters（饮水量，按天一杯数记录 {day:'YYYY-MM-DD', cups}）
 * ================================================================== */
let db = null;

export function openDB(){
  return new Promise((res, rej)=>{
    const r = indexedDB.open('fodmap-db', 5);
    r.onupgradeneeded = e=>{
      const d = e.target.result;
      ['meals','symptoms','templates','moods','bowels','coffees','waters'].forEach(s=>{
        if(!d.objectStoreNames.contains(s)) d.createObjectStore(s, {keyPath:'id', autoIncrement:true});
      });
    };
    r.onsuccess = e=>{ db = e.target.result; res(db); };
    r.onerror = ()=>rej(r.error);
  });
}

const store = (s,mode)=> db.transaction(s, mode).objectStore(s);
export const dbAdd   = (s,v)  => new Promise((res,rej)=>{ const r=store(s,'readwrite').add(v);   r.onsuccess=()=>res(r.result); r.onerror=()=>rej(r.error); });
export const dbPut   = (s,v)  => new Promise((res,rej)=>{ const r=store(s,'readwrite').put(v);   r.onsuccess=()=>res(r.result); r.onerror=()=>rej(r.error); });
export const dbDel   = (s,id) => new Promise((res,rej)=>{ const r=store(s,'readwrite').delete(id); r.onsuccess=()=>res();      r.onerror=()=>rej(r.error); });
export const dbAll   = s      => new Promise((res,rej)=>{ const r=store(s,'readonly').getAll();  r.onsuccess=()=>res(r.result||[]); r.onerror=()=>rej(r.error); });
export const dbClear = s      => new Promise((res,rej)=>{ const r=store(s,'readwrite').clear();  r.onsuccess=()=>res();      r.onerror=()=>rej(r.error); });
