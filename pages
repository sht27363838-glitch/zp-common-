// src/pages/C5.tsx
import React from 'react'
import { loadCSV } from '../lib/csv'
import { SimpleTable } from '../components/SimpleTable'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

type Ret = { order_id:string, sku:string, reason:string, date:string }
type Rev = { rating?:string, text?:string }

export default function C5(){
  const [returns,setReturns]=React.useState<Ret[]>([])
  const [reviews,setReviews]=React.useState<Rev[]>([])

  React.useEffect(()=>{
    loadCSV('/src/data/returns.csv').then((r:any)=>setReturns(r))
    loadCSV('/src/data/reviews.csv').then((r:any)=>setReviews(r)).catch(()=>{})
  },[])

  const reasons = new Map<string,number>()
  returns.forEach(r=> reasons.set(r.reason, (reasons.get(r.reason)||0)+1))
  const top5 = Array.from(reasons.entries()).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([reason,count])=>({reason,count}))

  return (<div className='container'>
    <div className='grid grid-2'>
      <div className='card'>
        <b>반품 사유 TOP5</b>
        {top5.length===0? <div className='caption'>returns.csv 데이터 대기</div>:
        <div style={{height:260}}>
          <ResponsiveContainer>
            <BarChart data={top5}>
              <XAxis dataKey='reason' tick={{fontSize:12}}/>
              <YAxis tick={{fontSize:12}}/>
              <Tooltip/>
              <Bar dataKey='count' fill='var(--warn)'/>
            </BarChart>
          </ResponsiveContainer>
        </div>}
      </div>

      <div className='card'>
        <b>리뷰 분포</b>
        {reviews.length===0? <div className='caption'>reviews.csv(옵션) 데이터 대기</div>:
          <div className='hint'>샘플: 평점 분포/키워드 분석은 v2.5에서 강화</div>}
      </div>
    </div>

    <div style={{height:12}}/>
    <div className='card'><b>원시 데이터 미리보기</b></div>
    <SimpleTable rows={returns.slice(0,40) as any}/>
  </div>)
}
