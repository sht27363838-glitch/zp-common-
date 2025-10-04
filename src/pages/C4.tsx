
import React from 'react'
import { loadCSV } from '../lib/csv'
import { SimpleTable } from '../components/SimpleTable'
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'

type L = { date:string, quest_id:string, type:string, stable_amt:string, edge_amt:string, lock_until:string, proof_url:string }

export default function C4(){
  const [ledger,setLedger]=React.useState<L[]>([])
  const [rebalance,setRebalance]=React.useState<Record<string,string>[]>([])

  React.useEffect(()=>{
    Promise.all([loadCSV('/src/data/ledger.csv'), loadCSV('/src/data/rebalance_log.csv')]).then(([l,r])=>{
      setLedger(l as any[])
      setRebalance(r)
    })
  },[])

  const byDate = new Map<string,{date:string,stable:number,edge:number}>()
  ledger.forEach((r:any)=>{
    const d = r.date
    if(!byDate.has(d)) byDate.set(d,{date:d,stable:0,edge:0})
    byDate.get(d)!.stable += Number(r.stable_amt||0)
    byDate.get(d)!.edge += Number(r.edge_amt||0)
  })
  const sortedDates = Array.from(byDate.values()).sort((a,b)=> a.date.localeCompare(b.date))
  let cumS=0, cumE=0
  const timeline = sortedDates.map(p=>{
    cumS += p.stable; cumE += p.edge
    return {date:p.date, stable:cumS, edge:cumE}
  })

  return (<div className='container'>
    <div className='card'><b>보상 타임라인(누적)</b></div>
    <div className='card' style={{height:280}}>
      <ResponsiveContainer>
        <LineChart data={timeline}>
          <XAxis dataKey='date' tick={{fontSize:12}}/>
          <YAxis tick={{fontSize:12}}/>
          <Tooltip/>
          <Legend/>
          <Line type='stepAfter' dataKey='stable' stroke='var(--success)' strokeWidth={2} dot={false}/>
          <Line type='stepAfter' dataKey='edge' stroke='var(--info)' strokeWidth={2} dot={false}/>
        </LineChart>
      </ResponsiveContainer>
      <div className='hint'>녹색=안정, 보라=엣지. ledger.csv 기준.</div>
    </div>

    <div style={{height:12}}/>
    <div className='card'><b>원장 / 리밸런스 로그</b><div className='hint'>원시 데이터 미리보기</div></div>
    <div style={{height:8}}/>
    <SimpleTable rows={ledger as any}/>
  </div>)
}
