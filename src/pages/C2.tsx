
import React from 'react'
import { loadCSV } from '../lib/csv'
import { SimpleTable } from '../components/SimpleTable'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from 'recharts'

type Comm = { order_id:string, kind:'base'|'upsell'|'bundle'|'discount', amount:string, source:string, sku:string }
type KPI = { date:string, channel:string, visits:string, clicks:string, carts:string, orders:string }

export default function C2(){
  const [items,setItems]=React.useState<Comm[]>([])
  const [kpis,setKpis]=React.useState<KPI[]>([])
  React.useEffect(()=>{
    loadCSV('/src/data/commerce_items.csv').then((r:any)=>setItems(r))
    loadCSV('/src/data/kpi_daily.csv').then((r:any)=>setKpis(r))
  },[])

  const byOrder = new Map<string, {base:number,upsell:number,bundle:number,discount:number}>()
  items.forEach((it:any)=>{
    const o = byOrder.get(it.order_id) || {base:0,upsell:0,bundle:0,discount:0}
    const v = Number(it.amount||0)
    if(it.kind==='base') o.base += v
    if(it.kind==='upsell') o.upsell += v
    if(it.kind==='bundle') o.bundle += v
    if(it.kind==='discount') o.discount += v
    byOrder.set(it.order_id, o)
  })
  const orders = Array.from(byOrder.values())
  const avg = (key:'base'|'upsell'|'bundle'|'discount') => {
    if(orders.length===0) return 0
    const sum = orders.reduce((a,o)=>a+(o as any)[key],0)
    return sum/orders.length
  }
  const wf = [
    {name:'기본', value: Math.max(0, Math.round(avg('base'))) },
    {name:'업셀', value: Math.max(0, Math.round(avg('upsell'))) },
    {name:'번들', value: Math.max(0, Math.round(avg('bundle'))) },
    {name:'할인', value: Math.round(avg('discount')) },
  ]
  const aov = wf.reduce((a,x)=>a+x.value,0)

  const last7 = kpis.slice(-7)
  const agg = last7.reduce((a:any,r:any)=>{
    a.visits += Number(r.visits||0)
    a.carts += Number(r.carts||0)
    a.orders += Number(r.orders||0)
    return a
  }, {visits:0,carts:0,orders:0})
  const cr1 = agg.visits? (agg.carts/agg.visits) : 0
  const cr2 = agg.carts? (agg.orders/agg.carts) : 0

  return (<div className='container'>
    <div className='grid grid-2'>
      <div className='card'>
        <b>AOV 워터폴(평균/주문)</b>
        <div className='hint'>기본 + 업셀 + 번들 + 할인 = AOV</div>
        <div style={{height:8}}/>
        <div style={{width:'100%', height:260}}>
          <ResponsiveContainer>
            <BarChart data={wf}>
              <XAxis dataKey='name' tick={{fontSize:12}}/>
              <YAxis tick={{fontSize:12}}/>
              <Tooltip/>
              <Bar dataKey='value' fill='var(--accent)'>
                <LabelList dataKey='value' position='top' formatter={(v:any)=>v.toLocaleString()}/>
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className='hint'>AOV ≈ <b>{Math.round(aov).toLocaleString()}원</b></div>
      </div>

      <div className='card'>
        <b>체크아웃 누수 트리(최근 7일)</b>
        <div>방문 → 장바구니 → 결제 (CR1 {(cr1*100).toFixed(1)}% / CR2 {(cr2*100).toFixed(1)}%)</div>
        <div className='hint'>CR1=장바구니/방문, CR2=결제/장바구니</div>
      </div>
    </div>

    <div style={{height:12}}/>
    <div className='card'><b>원시 데이터(상위 40행)</b></div>
    <SimpleTable rows={items.slice(0,40) as any}/>
  </div>)
}
