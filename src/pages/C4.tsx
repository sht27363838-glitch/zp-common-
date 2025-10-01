
import React from 'react'
import { loadCSV } from '../lib/csv'
import { SimpleTable } from '../components/SimpleTable'

export default function C4(){
  const [ledger,setLedger]=React.useState<Record<string,string>[]>([])
  const [rebalance,setRebalance]=React.useState<Record<string,string>[]>([])
  React.useEffect(()=>{
    loadCSV('/src/data/ledger.csv').then(setLedger)
    loadCSV('/src/data/rebalance_log.csv').then(setRebalance)
  },[])
  return (<div className='container'>
    <div className='card'><b>보상엔진 — 원장 & 리밸런스 로그</b><div className='hint'>v2.1에서 타임라인(스텝)과 락업 캘린더 추가 예정 슬롯</div></div>
    <div style={{height:8}}/>
    <SimpleTable rows={ledger}/>
    <div style={{height:16}}/>
    <SimpleTable rows={rebalance}/>
  </div>)
}
