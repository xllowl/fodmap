/* ==================================================================
 * IndexedDB 封装：meals / symptoms / templates 三个 store
 * ================================================================== */
let db = null;

export function openDB(){
  return new Promise((res, rej)=>{
    const r = indexedDB.open('fodmap-db', 1);
    r.onupgradeneeded = e=>{
      const d = e.target.result;
      ['meals','symptoms','templates'].forEach(s=>{
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
