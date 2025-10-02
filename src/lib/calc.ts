
export const safe = (n:number,d:number)=> d===0 ? 0 : n/d
export function uplift(ctrlConv:number, ctrlBase:number, varConv:number, varBase:number){
  const rc = safe(ctrlConv, ctrlBase)
  const rv = safe(varConv, varBase)
  return safe(rv-rc, rc)
}
export function winner(u:number, ctrlBase:number, varBase:number){
  if(ctrlBase>=500 && varBase>=500 && u>=0.10) return true
  return false
}
