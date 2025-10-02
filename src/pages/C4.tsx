
import React from 'react'
import { loadCSV } from '../lib/csv'
import { SimpleTable } from '../components/SimpleTable'
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'

type L = { date:string, quest_id:string, type:string, stable_amt:string, edge_amt:string, lock_until:string, proof_url:string }

export default function C4(){
  const [ledger,setLedger]=React.useState<L[]>([])
  const [rebalance,setRebalance]=React.useState<Record<string,string>[]>([])
  React.useEffect(()=>{
    loadCSV('/src/data/ledger.csv').then((r:any)=>setLedger(r))
    loadCSV('/src/data/rebalance_log.csv').then(setRebalance)
  },[])

  const byDate = new Map<string,{date:string,stable:number,edge:number}>()
  ledger.forEach(r=>{
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

  const today = new Date().toISOString().slice(0,10)
  const locks = ledger
    .filter(r=>r.lock_until)
    .map(r=>({ lock:r.lock_until, type:Number(r.edge_amt||0)>0?'엣지':'안정', quest:r.quest_id, amount:Number(r.edge_amt||0)||Number(r.stable_amt||0) }))
    .sort((a,b)=> a.lock.localeCompare(b.lock))

  const upcoming = locks.filter(l=> l.lock>=today).slice(0,8)
  const past = locks.filter(l=> l.lock<today).slice(-8)

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
      <div className='hint'>녹색=안정, 보라=엣지. ledger.csv 기준 누적.</div>
    </div>

    <div className='grid grid-2'>
      <div className='card'>
        <b>락업 캘린더 — 곧 언락</b>
        <div className='lock-grid'>
          {upcoming.map((l,i)=>(
            <div key={i} className='lock-item'>
              <div><b>{l.lock}</b> · {l.type}</div>
              <div className='caption'>QID {l.quest} / {l.amount.toLocaleString()}원</div>
            </div>
          ))}
          {upcoming.length===0 && <div className='caption'>예정 없음</div>}
        </div>
      </div>
      <div className='card'>
        <b>락업 캘린더 — 최근 해제</b>
        <div className='lock-grid'>
          {past.map((l,i)=>(
            <div key={i} className='lock-item'>
              <div><b>{l.lock}</b> · {l.type}</div>
              <div className='caption'>QID {l.quest} / {l.amount.toLocaleString()}원</div>
            </div>
          ))}
          {past.length===0 && <div className='caption'>내역 없음</div>}
        </div>
      </div>
    </div>

    <div style={{height:12}}/>
    <div className='card'><b>원장 / 리밸런스 로그</b><div className='hint'>아래 테이블은 원시 데이터입니다.</div></div>
    <div style={{height:8}}/>
    <SimpleTable rows={ledger as any}/>
  </div>)
}
