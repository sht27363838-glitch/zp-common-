
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

  // AOV waterfall
  const byOrder = new Map<string, {base:number,upsell:number,bundle:number,discount:number}>()
  items.forEach((it:any)=>{
    const o = byOrder.get(it.order_id) || {base:0,upsell:0,bundle:0,discount:0}
    const v = Number(it.amount||0)
    if(it.kind==='base') o.base += v
    if(it.kind==='upsell') o.upsell += v
    if(it.kind==='bundle') o.bundle += v
    if(it.kind==='discount') o.discount += v // negative
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

  // Heatmap (Revenue share by SKU x Source)
  const revenueCells = new Map<string, number>()
  const skuSet = new Set<string>()
  const srcSet = new Set<string>()
  items.forEach((it:any)=>{
    const amt = Number(it.amount||0)
    if(amt<=0) return
    skuSet.add(it.sku)
    srcSet.add(it.source)
    const key = `${it.sku}__${it.source}`
    revenueCells.set(key, (revenueCells.get(key)||0) + amt)
  })
  const skus = Array.from(skuSet).slice(0,6)
  const sources = Array.from(srcSet).slice(0,4)
  const maxCell = Math.max(1, ...Array.from(revenueCells.values()))

  // Checkout funnel (7-day aggregate)
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
                <LabelList dataKey='value' position='top' formatter={(v)=>v.toLocaleString()}/>
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className='hint'>AOV ≈ <b>{Math.round(aov).toLocaleString()}원</b></div>
      </div>

      <div className='card'>
        <b>체크아웃 누수 트리(최근 7일)</b>
        <div className='funnel'>
          <div style={{width:120}}>방문</div>
          <div className='fbar' style={{width: '160px'}}></div>
          <div>{agg.visits.toLocaleString()}</div>
        </div>
        <div className='funnel'>
          <div style={{width:120}}>장바구니</div>
          <div className='fbar' style={{width: `${Math.max(8, Math.round(160*cr1))}px`}}></div>
          <div>{agg.carts.toLocaleString()}  <span className='caption'>(CR1 {(cr1*100).toFixed(1)}%)</span></div>
        </div>
        <div className='funnel'>
          <div style={{width:120}}>결제</div>
          <div className='fbar' style={{width: `${Math.max(8, Math.round(160*cr1*cr2))}px`}}></div>
          <div>{agg.orders.toLocaleString()}  <span className='caption'>(CR2 {(cr2*100).toFixed(1)}%)</span></div>
        </div>
        <div className='hint'>CR1=장바구니/방문, CR2=결제/장바구니</div>
      </div>
    </div>

    <div style={{height:12}}/>

    <div className='card'>
      <b>상품×소스 히트맵(수익 비중)</b>
      <div className='hint'>진한 셀 = 해당 SKU·소스의 수익 기여도가 큰 구간</div>
      <div className='heat'>
        <div className='heat-row'>
          <div className='caption'>SKU \ Source</div>
          {sources.map(s=> <div key={s} className='caption' style={{textAlign:'center'}}>{s}</div>)}
        </div>
        {skus.map(sku=>{
          return (<div key={sku} className='heat-row'>
            <div className='caption'>{sku}</div>
            {sources.map(src=>{
              const val = revenueCells.get(`${sku}__${src}`) || 0
              const ratio = Math.min(1, val / maxCell)
              const bg = `rgba(14,165,233,${0.1 + ratio*0.6})`
              return <div key={src} className='heat-cell' style={{background:bg}}>{val? Math.round(val/1000)+'k' : '-'}</div>
            })}
          </div>)
        })}
      </div>
    </div>

    <div style={{height:12}}/>
    <div className='card'><b>원시 데이터(상위 40행)</b></div>
    <SimpleTable rows={items.slice(0,40) as any}/>
  </div>)
}
