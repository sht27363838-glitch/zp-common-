
import React, { useEffect, useMemo, useState } from 'react';
import { KpiCard } from '../components/KpiCard';
import { loadCSV } from '../lib/csv';
import { CR, ROAS, AOV, ReturnsRate, capUsage, movingAvg } from '../lib/calc';
import Donut from '../components/Donut';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

type KRow = { date:string, channel:string, visits:string, clicks:string, carts:string, orders:string, revenue:string, ad_cost:string, returns:string, reviews:string }

function Badge({type,children}:{type:'danger'|'warn'|'info',children:React.ReactNode}){
  return <span className={`badge ${type}`}>{children}</span>
}

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
  const capUsed = capUsage(ledger.stable, ledger.edge, cap.last, cap.ratio)

  // ── 이상치 감지(간단 규칙)
  const clicks = rows.map(r=>Number(r.clicks||0))
  const visits = rows.map(r=>Number(r.visits||0))
  const orders = rows.map(r=>Number(r.orders||0))
  const adcost = rows.map(r=>Number(r.ad_cost||0))
  const returns = rows.map(r=>Number(r.returns||0))

  const ctrSeries = clicks.map((v,i)=> visits[i] ? v/visits[i] : 0)
  const cpaSeries = orders.map((v,i)=> v ? adcost[i]/v : 0)
  const retSeries = orders.map((v,i)=> v ? returns[i]/v : 0)

  const ctrMAprev = ctrSeries.length>=6 ? movingAvg(ctrSeries.slice(0,-3),3) : 0
  const ctrMAlast = ctrSeries.length>=3 ? movingAvg(ctrSeries,3) : 0
  const ctrDrop = ctrMAprev>0 && ctrMAlast < ctrMAprev*0.8

  const cpaMAprev = cpaSeries.length>=6 ? movingAvg(cpaSeries.slice(0,-3),3) : 0
  const cpaMAlast = cpaSeries.length>=3 ? movingAvg(cpaSeries,3) : 0
  const cpaSpike = cpaMAprev>0 && cpaMAlast > cpaMAprev*1.4

  const retMAlast = retSeries.length>=7 ? movingAvg(retSeries.slice(-7),7) : movingAvg(retSeries, retSeries.length||1)
  const returnsHigh = retMAlast > 0.03

  // ── 3줄 요약 (상태→판단→지시)
  const state = `ROAS ${ROAS(latest as any).toFixed(2)}, CR ${(CR(latest as any)*100).toFixed(2)}%, Cap ${(capUsed*100).toFixed(0)}%`
  let assess = '안정'
  if(cpaSpike) assess = 'CAC 상승'
  else if(ctrDrop) assess = 'CTR 급락'
  else if(returnsHigh) assess = '반품 경보'
  const command =
    cpaSpike ? '세트 A 중지, B 예산 20% 이동' :
    ctrDrop ? '새 훅 2건 제작, 피로 애드셋 오프' :
    returnsHigh ? 'PDP 상단 클레임 Top3 노출' :
    '승자 유지, 내일 재평가'

  return (<div className='container'>
    <div className='grid grid-3'>
      <KpiCard label='매출' value={latest.revenue}/>
      <KpiCard label='ROAS' value={Number(ROAS(latest as any).toFixed(2))}/>
      <KpiCard label='CR' value={Number((CR(latest as any)*100).toFixed(2))} suffix='%' />
      <KpiCard label='AOV' value={Number(AOV(latest as any).toFixed(0))}/>
      <KpiCard label='반품률' value={Number((ReturnsRate(latest as any)*100).toFixed(2))} suffix='%' />
      <KpiCard label='보상총액' value={ledger.stable+ledger.edge}/>
    </div>

    <div style={{height:12}}/>

    <div className='card'>
      <b>보상 캡 사용률</b>
      <div className='gauge'><div style={{width:`${Math.min(100, Math.round(capUsed*100))}%`}}/></div>
      <div className='hint'>집행합계 / (전월 순익 × {Math.round(cap.ratio*100)}%) — last={cap.last.toLocaleString()}원</div>
    </div>

    <div style={{height:12}}/>

    <div className='badges'>
      {cpaSpike && <Badge type='danger'>CAC 스파이크</Badge>}
      {ctrDrop && <Badge type='warn'>CTR 급락</Badge>}
      {returnsHigh && <Badge type='warn'>반품률 > 3%</Badge>}
      {edgeShare>0.30 && <Badge type='info'>엣지 > 30% (리밸런싱 필요)</Badge>}
    </div>

    <div style={{height:12}}/>

    <div className='card'>
      <b>상태 → 판단 → 지시</b>
      <div className='hint'>{state} / {assess} / {command}</div>
    </div>

    <div style={{height:12}}/>

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
      </div>
      <Donut ratio={edgeShare} label='목표 밴드 15~30%'/>
    </div>
  </div>)
}
