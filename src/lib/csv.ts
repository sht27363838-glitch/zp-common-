
export async function loadCSV(path:string): Promise<Record<string,string>[]> {
  try{
    const res = await fetch(path); if(!res.ok) return [];
    const text = await res.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    if(lines.length===0) return [];
    const headers = lines[0].split(',').map(s=>s.trim());
    return lines.slice(1).map(l=>{
      const vals = l.split(',').map(s=>s.trim());
      const obj: Record<string,string> = {};
      headers.forEach((h,i)=> obj[h] = vals[i] ?? '' );
      return obj;
    });
  }catch{ return []; }
}
