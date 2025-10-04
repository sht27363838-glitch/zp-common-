
import React from 'react'
import { loadCSV } from '../lib/csv'

type Rules = { scale:{roas_gte:number,cpa_to_aov_lte:number,ctr_gte:number}, keep:{roas_gte:number,cpa_to_aov_lte:number}, kill:{otherwise:boolean} }
const safe = (n:number,d:number)=> d===0?0:n/d

export default function DQ(){
  const [latest,setLatest]=React.useState<any>(null)
  const [rules,setRules]=React.useState<Rules|null>(null)

  React.useEffect(()=>{
    (async()=>{
      const k = await loadCSV('/src/data/kpi_daily.csv')
      const r = await fetch('/src/data/rules.json').then(r=>r.ok?r.json():null)
      setRules(r)
      if(k.length>0){
        const last:any = k[k.length-1]
        const visits = Number(last.visits||0)
        const clicks = Number(last.clicks||0)
        const orders = Number(last.orders||0)
        const revenue = Number(last.revenue||0)
        const ad_cost = Number(last.ad_cost||0)
        const cr = safe(orders,visits)
        const roas = safe(revenue, ad_cost)
        const aov = safe(revenue, orders)
        const cpa = safe(ad_cost, orders)
        const ctr = safe(clicks, visits)
        setLatest({visits,clicks,orders,revenue,ad_cost,cr,roas,aov,cpa,ctr})
      }
    })()
  },[])

  function judge(){
    if(!latest || !rules) return {gate:'-', reason:'데이터 없음'}
    const r = rules
    if(latest.roas >= r.scale.roas_gte && latest.cpa <= latest.aov * r.scale.cpa_to_aov_lte && latest.ctr >= r.scale.ctr_gte){
      return {gate:'SCALE ▲', reason:`ROAS ${latest.roas.toFixed(2)} / CPA≤AOV×${r.scale.cpa_to_aov_lte} / CTR ${(latest.ctr*100).toFixed(2)}%`}
    }
    if(latest.roas >= r.keep.roas_gte || latest.cpa <= latest.aov * r.keep.cpa_to_aov_lte){
      return {gate:'KEEP ■', reason:`경계선: ROAS ${latest.roas.toFixed(2)} / CPA ${(latest.cpa).toFixed(0)} (AOV ${(latest.aov).toFixed(0)})`}
    }
    return {gate:'KILL ✖', reason:`ROAS ${latest.roas.toFixed(2)}, CPA ${(latest.cpa).toFixed(0)} (AOV ${(latest.aov).toFixed(0)}) 초과`}
  }

  const res = judge()

  return (<div className='container'>
    <div className='card'><b>Decision Queue — 자동 게이트</b>
      <div className='hint'>rules.json 기준 SCALE/KEEP/KILL 판정</div>
    </div>

    <div className='grid grid-3'>
      <div className='card'><b>ROAS</b><div style={{fontSize:28,fontWeight:700}}>{latest? latest.roas.toFixed(2):'0.00'}</div></div>
      <div className='card'><b>CPA</b><div style={{fontSize:28,fontWeight:700}}>{latest? Math.round(latest.cpa).toLocaleString():'0'}</div></div>
      <div className='card'><b>AOV</b><div style={{fontSize:28,fontWeight:700}}>{latest? Math.round(latest.aov).toLocaleString():'0'}</div></div>
    </div>

    <div className='card'>
      <div className={res.gate.startsWith('SCALE')?'successline':res.gate.startsWith('KILL')?'warnline':''}>
        <b>판정:</b> {res.gate} — {res.reason}
      </div>
      <div className='hint'>조치: SCALE → 예산 +20% / KEEP → 유지 / KILL → 중지 후 훅 교체</div>
    </div>
  </div>)
}
