
import React from 'react'
import { loadCSV } from '../lib/csv'
import { SimpleTable } from '../components/SimpleTable'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

type Row = { date:string, creative_id:string, impressions:string, clicks:string, spend:string, orders:string, revenue:string }

export default function C1(){
  const [rows,setRows]=React.useState<Row[]>([])
  React.useEffect(()=>{ loadCSV('/src/data/creative_results.csv').then((r:any)=>setRows(r)) },[])

  const league = rows.map(r=>({
    id:r.creative_id,
    ctr: Number(r.clicks)/Math.max(1, Number(r.impressions)),
    cvr: Number(r.orders)/Math.max(1, Number(r.clicks)),
    rpm: Number(r.revenue)/Math.max(1, Number(r.impressions))*1000
  })).sort((a,b)=> b.rpm-a.rpm).slice(0,8)

  return (<div className='container'>
    <div className='card'><b>크리에이티브 리그(상위 8) — CTR / CVR / 1,000회당 매출</b></div>
    <div style={{height:8}}/>
    <div className='card' style={{height:280}}>
      <ResponsiveContainer>
        <BarChart data={league}>
          <XAxis dataKey='id' tick={{fontSize:12}}/>
          <YAxis tick={{fontSize:12}}/>
          <Tooltip/>
          <Bar dataKey='rpm' fill='var(--accent)'/>
        </BarChart>
      </ResponsiveContainer>
      <div className='hint'>막대는 1,000회 노출당 매출. CTR/CVR은 테이블에서 확인.</div>
    </div>
    <div style={{height:12}}/>
    <SimpleTable rows={rows}/>
  </div>)
}
