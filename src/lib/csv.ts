// src/lib/csv.ts
export type Row = Record<string, string>

export function parseCSV(text: string): Row[] {
  const lines = text.trim().split(/\r?\n/)
  if(lines.length===0) return []
  const head = lines[0].split(',').map(h=>h.trim())
  const rows: Row[] = []
  for(let i=1;i<lines.length;i++){
    const cols = lines[i].split(',').map(c=>c.trim())
    const obj: Row = {}
    head.forEach((h,idx)=> obj[h] = (cols[idx] ?? ''))
    rows.push(obj)
  }
  return rows
}

function normalizeLink(url: string): string {
  const g = url.match(/https:\/\/drive\.google\.com\/file\/d\/([^\/]+)\//)
  if(g){ return `https://drive.google.com/uc?export=download&id=${g[1]}` }
  if(url.includes('dropbox.com')){
    try{
      const u = new URL(url); u.searchParams.set('dl','1'); return u.toString()
    }catch(e){ return url }
  }
  return url
}

export async function loadCSV(path: string): Promise<Row[]> {
  const mapRaw = localStorage.getItem('zp_data_sources')
  const map = mapRaw ? JSON.parse(mapRaw) as Record<string,string> : {}
  const fileKey = path.split('/').pop() || path

  const tryUrls: string[] = []
  if(map[fileKey]) tryUrls.push(normalizeLink(map[fileKey]))
  tryUrls.push(path)

  for(const u of tryUrls){
    try{
      const res = await fetch(u)
      if(!res.ok) continue
      const txt = await res.text()
      return parseCSV(txt)
    }catch(e){
      continue
    }
  }
  return []
}
