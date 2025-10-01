
import React, { useEffect, useMemo, useState } from 'react';
import { KpiCard } from '../components/KpiCard';
import { loadCSV } from '../lib/csv';
import { CR, ROAS, AOV, ReturnsRate } from '../lib/calc';
import Donut from '../components/Donut';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

type KRow = { date:string, channel:string, visits:string, clicks:string, carts:string, orders:string, revenue:string, ad_cost:string, returns:string, reviews:string }

export default function C0(){
  const [rows,setRows]=useState<KRow[]>([])
  const [cap,setCap]=useState({last:0,ratio:0.10})
  const [ledger,setLedger]=useState({stable:0,edge:0})

  useEffect(()=>{(async()=>{
    const ks = await loadCSV('/src/data/kpi_daily.csv') as KRow[]
    setRows(ks)
    const settings=await loadCSV('/src/data/settings.csv')
    if(settings[0]) setCap({last:Number(settings[0].last_month_profit||0),ratio:Number(settings[0].cap_ratio||0.10)})
    const lrows=await loadCSV('/src/data/ledger.csv')
    const sums=lrows.reduce((a,r)=>{a.stable+=Number(r.stable_amt||0);a.edge+=Number(r.edge_amt||0);return a;},{stable:0,edge:0})
    setLedger(sums)
  })()},[])

  const latest = useMemo(()=>{
    if(rows.length===0) return { visits:0, clicks:0, carts:0, orders:0, revenue:0, ad_cost:0, returns:0 }
    const r = rows[rows.length-1]
    return {
      visits:Number(r.visits||0),
      clicks:Number(r.clicks||0),
      carts:Number(r.carts||0),
      orders:Number(r.orders||0),
      revenue:Number(r.revenue||0),
      ad_cost:Number(r.ad_cost||0),
      returns:Number(r.returns||0)
    }
  },[rows])

  const series = rows.map(r=>({ date:r.date, revenue:Number(r.revenue||0), orders:Number(r.orders||0) }))
  const edgeShare = (ledger.stable+ledger.edge)===0? 0 : ledger.edge/(ledger.stable+ledger.edge)

  return (<div className='container'>
    <div className='grid grid-3'>
      <KpiCard label='매출' value={latest.revenue}/>
      <KpiCard label='ROAS' value={Number(ROAS(latest as any).toFixed(2))}/>
      <KpiCard label='CR' value={Number((CR(latest as any)*100).toFixed(2))} suffix='%' />
      <KpiCard label='AOV' value={Number(AOV(latest as any).toFixed(0))}/>
      <KpiCard label='반품률' value={Number((ReturnsRate(latest as any)*100).toFixed(2))} suffix='%' />
      <KpiCard label='보상총액' value={ledger.stable+ledger.edge}/>
    </div>
    <div style={{height:16}}/>
    <div className='grid grid-2'>
      <div className='card'>
        <b>매출 추세(14일)</b>
        <div style={{height:8}}/>
        <div style={{width:'100%', height:240}}>
          <ResponsiveContainer>
            <AreaChart data={series}>
              <XAxis dataKey='date' tick={{fontSize:12}}/>
              <YAxis tick={{fontSize:12}}/>
              <Tooltip/>
              <Area type='monotone' dataKey='revenue' stroke='var(--accent)' fill='var(--accent)' fillOpacity={0.15} strokeWidth={2}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className='hint'>C0 규칙: “상태→판단→지시” 패널은 v2.1에서 추가</div>
      </div>
      <Donut ratio={edgeShare} label='목표 밴드 15~30%'/>
    </div>
  </div>)
}
