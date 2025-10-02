
export type KPI = { visits:number; clicks:number; carts:number; orders:number; revenue:number; ad_cost:number; returns:number }
export const safe = (n:number,d:number)=> d===0 ? 0 : n/d
export const CR = (k:KPI) => safe(k.orders,k.visits)
export const ROAS = (k:KPI) => safe(k.revenue,k.ad_cost)
export const AOV = (k:KPI) => safe(k.revenue,k.orders)
export const ReturnsRate = (k:KPI) => safe(k.returns,k.orders)
export const sum = (arr:number[]) => arr.reduce((a,b)=>a+b,0)
export const capUsage = (stable:number, edge:number, last:number, capRatio:number) => {
  const cap = last*capRatio
  return cap===0 ? 0 : (stable+edge)/cap
}
export const movingAvg = (arr:number[], n:number)=>{
  if(n<=0) return 0
  const take = arr.slice(-n)
  const s = take.reduce((a,b)=>a+b,0)
  return take.length? s/take.length : 0
}
