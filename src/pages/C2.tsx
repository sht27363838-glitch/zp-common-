// src/pages/C2.tsx
import React from 'react'
import { loadCSV } from '../lib/csv'
import { SimpleTable } from '../components/SimpleTable'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from 'recharts'

type Comm = { date?:string, order_id:string, kind:'base'|'upsell'|'bundle'|'discount', amount:string, source:string, sku:string }
type KPI = { date:string, channel:string, visits:string, clicks:string, carts:string, orders:string }

export default function C2(){
  const [items,setItems]=React.useState<Comm[]>([])
  const [kpis,setKpis]=React.useState<KPI[]>([])
  const [range,setRange]=React.useState<'7d'|'30d'>('7d')

  React.useEffect(()=>{
    loadCSV('/src/data/commerce_items.csv').then((r:any)=>setItems(r))
    loadCSV('/src/data/kpi_daily.csv').then((r:any)=>setKpis(r))
  },[])

  const days = range==='7d'? 7 : 30
  const kSel = kpis.slice(-days)
  const agg = kSel.reduce((a:any,r:any)=>{ a.visits+=+r.visits||0; a.carts+=+r.carts||0; a.orders+=+r.orders||0; return a },{visits:0,carts:0,orders:0})
  const cr1 = agg.visits? (agg.carts/agg.visits) : 0
  const cr2 = agg.carts? (agg.orders/agg.carts) : 0

  const within = (d?:string)=> !d ? true : (()=>{
    const dd = new Date(d as string).getTime()
    const from = new Date(kpis.length? kpis[kpis.length-days]?.date||'1970-01-01' : '1970-01-01').getTime()
    const to   = new Date(kpis.length? kpis[kpis.length-1]?.date||'2999-12-31' : '2999-12-31').getTime()
    return dd>=from && dd<=to
  })()

  const byOrder = new Map<string,{base:number,upsell:number,bundle:number,discount:number}>()
  items.filter(it=>within(it.date)).forEach((it:any)=>{
    const o = byOrder.get(it.order_id) || {base:0,upsell:0,bundle:0,discount:0}
    const v = Number(it.amount||0)
    if(it.kind==='base') o.base += v
    if(it.kind==='upsell') o.upsell += v
    if(it.kind==='bundle') o.bundle += v
    if(it.kind==='discount') o.discount += v
    byOrder.set(it.order_id, o)
  })
  const orders = Array.from(byOrder.values())
  const avg = (k:'base'|'upsell'|'bundle'|'discount')=> orders.length? orders.reduce((a,o)=>a+o[k],0)/orders.length : 0
  const wf = [
    {name:'기본', value: Math.max(0, Math.round(avg('base'))) },
    {name:'업셀', value: Math.max(0, Math.round(avg('upsell'))) },
    {name:'번들', value: Math.max(0, Math.round(avg('bundle'))) },
    {name:'할인', value: Math.round(avg('discount')) },
  ]
  const aov = wf.reduce((a,x)=>a+x.value,0)

  const revenueCells = new Map<string, number>()
  const skuSet = new Set<string>(), srcSet = new Set<string>()
  items.filter(it=>within(it.date)).forEach((it:any)=>{
    const amt = Number(it.amount||0); if(amt<=0) return
    skuSet.add(it.sku); srcSet.add(it.source)
    const key = `${it.sku}__${it.source}`
    revenueCells.set(key, (revenueCells.get(key)||0)+amt)
  })
  const skus = Array.from(skuSet).slice(0,6)
  const sources = Array.from(srcSet).slice(0,4)
  const maxVal = Math.max(1, ...Array.from(revenueCells.values()))

  return (<div className='container'>
    <div className='card'>
      <b>기간</b> &nbsp;
      <label><input type='radio' checked={range==='7d'} onChange={()=>setRange('7d')}/> 7일</label>&nbsp;
      <label><input type='radio' checked={range==='30d'} onChange={()=>setRange('30d')}/> 30일</label>
      {!items.some(i=>i.date) && <div className='hint'>※ commerce_items.csv에 <b>date</b> 열이 없어서 히트맵/AOV는 전체 집계로 표시됩니다.</div>}
    </div>

    <div className='grid grid-2' style={{marginTop:12}}>
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
        <b>체크아웃 누수 트리(최근 {range==='7d'?'7':'30'}일)</b>
        <div>방문 → 장바구니 → 결제 (CR1 {(cr1*100).toFixed(1)}% / CR2 {(cr2*100).toFixed(1)}%)</div>
        <div className='hint'>CR1=장바구니/방문, CR2=결제/장바구니</div>
      </div>
    </div>

    <div style={{height:12}}/>
    <div className='card'>
      <b>상품×소스 히트맵(수익 비중)</b>
      <div className='hint'>진한 셀 = 해당 SKU·소스의 수익 기여도가 큰 구간</div>
      <div style={{display:'grid', gridTemplateColumns:`160px repeat(${Math.max(1,sources.length)}, 1fr)`, gap:'6px', marginTop:8}}>
        <div style={{fontSize:12, opacity:.7}}>SKU \ Source</div>
        {sources.map(s=> <div key={s} style={{textAlign:'center', fontSize:12, opacity:.7}}>{s}</div>)}
        {skus.map(sku=>(
          <React.Fragment key={sku}>
            <div style={{fontSize:12}}>{sku}</div>
            {sources.map(src=>{
              const val = revenueCells.get(`${sku}__${src}`) || 0
              const ratio = Math.min(1, val / maxVal)
              const bg = `rgba(14,165,233,${0.1 + ratio*0.6})`
              return <div key={src} style={{background:bg, padding:'10px 6px', borderRadius:10, textAlign:'center'}}>{val? Math.round(val/1000)+'k' : '-'}</div>
            })}
          </React.Fragment>
        ))}
      </div>
    </div>

    <div style={{height:12}}/>
    <div className='card'><b>원시 데이터(상위 40행)</b></div>
    <SimpleTable rows={items.slice(0,40) as any}/>
  </div>)
}
