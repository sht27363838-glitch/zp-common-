// src/pages/C4.tsx
import React from 'react'
import { loadCSV } from '../lib/csv'
import { SimpleTable } from '../components/SimpleTable'
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'

type L = { date:string, quest_id:string, type:string, stable_amt:string, edge_amt:string, lock_until:string, proof_url:string }

function toCSV(rows:Record<string,any>[]) {
  if(rows.length===0) return ''
  const headers = Object.keys(rows[0])
  const body = rows.map(r=> headers.map(h=> String(r[h]??'')).join(',')).join('\n')
  return headers.join(',')+'\n'+body
}
function download(name:string, text:string){
  const blob = new Blob([text], {type:'text/csv;charset=utf-8;'})
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href=url; a.download=name; a.click()
  URL.revokeObjectURL(url)
}

export default function C4(){
  const [ledgerFile,setLedgerFile]=React.useState<L[]>([])
  const [rebalance,setRebalance]=React.useState<Record<string,string>[]>([])
  const [localLedger,setLocalLedger]=React.useState<any[]>([])

  const [quests,setQuests]=React.useState<any>(null)
  const [rules,setRules]=React.useState<any>(null)

  React.useEffect(()=>{
    (async()=>{
      const [l,r] = await Promise.all([loadCSV('/src/data/ledger.csv'), loadCSV('/src/data/rebalance_log.csv')])
      setLedgerFile(l as any[]); setRebalance(r)
      try{ setQuests(await (await fetch('/src/data/quests.json')).json()) }catch{ setQuests({
        weekly_boss_win:{ stable_pct:2.0, edge_pct:0.5 },
        monthly_boss_win:{ stable_pct:5.0, edge_pct:1.0 }
      }) }
      try{ setRules(await (await fetch('/src/data/rewards_rules.json')).json()) }catch{ setRules({
        cap_ratio:0.10, lockups:{stable_days:7, edge_days:30}
      }) }
      const saved = localStorage.getItem('zp_ledger_local')
      setLocalLedger(saved? JSON.parse(saved):[])
    })()
  },[])

  const byDate = new Map<string,{date:string,stable:number,edge:number}>()
  ;[...ledgerFile, ...localLedger].forEach((r:any)=>{
    const d = r.date
    if(!byDate.has(d)) byDate.set(d,{date:d,stable:0,edge:0})
    byDate.get(d)!.stable += Number(r.stable_amt||0)
    byDate.get(d)!.edge += Number(r.edge_amt||0)
  })
  const sortedDates = Array.from(byDate.values()).sort((a,b)=> a.date.localeCompare(b.date))
  let cumS=0, cumE=0
  const timeline = sortedDates.map(p=>{ cumS+=p.stable; cumE+=p.edge; return {date:p.date, stable:cumS, edge:cumE} })

  type LockEntry = { date:string, label:string, kind:'stable'|'edge' }
  const lockList:LockEntry[] = [...ledgerFile, ...localLedger].flatMap((r:any)=>{
    const until = r.lock_until?.slice(0,10)
    if(!until) return []
    const kind:LockEntry['kind'] = Number(r.edge_amt||0)>0 ? 'edge':'stable'
    return [{ date: until, label: `${r.quest_id || r.type || 'reward'}`, kind }]
  }).sort((a,b)=> a.date.localeCompare(b.date))

  function addReward(key:'daily_loop'|'weekly_boss_win'|'monthly_boss_win'){
    if(!quests || !rules) return
    const q = quests[key]; if(!q) return
    const today = new Date().toISOString().slice(0,10)
    const lockStable = rules.lockups?.stable_days ?? 7
    const lockEdge   = rules.lockups?.edge_days ?? 30
    const stable_amt = Math.round((q.stable_pct||0) * 1000)
    const edge_amt   = Math.round((q.edge_pct||0)   * 1000)
    const lock_until = new Date(Date.now() + ((edge_amt>0? lockEdge:lockStable) * 86400000)).toISOString().slice(0,10)

    const row = { date:today, quest_id:key, type:key.includes('daily')?'daily':key.includes('weekly')?'weekly':'monthly',
      stable_amt, edge_amt, lock_until, proof_url:'' }
    const next = [...localLedger, row]
    setLocalLedger(next); localStorage.setItem('zp_ledger_local', JSON.stringify(next))
  }
  function exportMergedCSV(){
    const merged = [...ledgerFile, ...localLedger]
    const csv = toCSV(merged as any)
    download('ledger_merged.csv', csv)
  }

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
      <div className='hint'>녹색=안정, 보라=엣지 (파일+로컬 합산 기준)</div>
    </div>

    <div style={{height:12}}/>
    <div className='card'>
      <b>락업 캘린더</b>
      <div className='hint'>안정 7일 / 엣지 30일 기준. `lock_until` 날짜대로 정렬.</div>
      <ul>
        {lockList.length===0 && <li className='caption'>락업 일정 없음</li>}
        {lockList.map((e,i)=>(<li key={i}><span className={`badge ${e.kind==='edge'?'info':'success'}`}>{e.kind.toUpperCase()}</span> {e.date} — {e.label}</li>))}
      </ul>
    </div>

    <div style={{height:12}}/>
    <div className='card'>
      <b>적립 액션(정적 환경)</b>
      <div className='hint'>버튼 → 로컬 원장에 행 추가 → "CSV 내보내기"로 내려받아 `src/data/ledger.csv` 교체 커밋</div>
      <div className='badges' style={{marginTop:8}}>
        <button className='badge info' onClick={()=>addReward('daily_loop')}>일일 루프 +0.2%</button>
        <button className='badge' onClick={()=>addReward('weekly_boss_win')}>주간 보스 +2.0%/+0.5%</button>
        <button className='badge' onClick={()=>addReward('monthly_boss_win')}>월간 보스 +5.0%/+1.0%</button>
        <button className='badge warn' onClick={()=>{ localStorage.removeItem('zp_ledger_local'); location.reload() }}>로컬 원장 초기화</button>
        <button className='badge' onClick={exportMergedCSV}>CSV 내보내기</button>
      </div>
    </div>

    <div style={{height:12}}/>
    <div className='card'><b>원장 / 리밸런스 로그</b><div className='hint'>원시 데이터 미리보기</div></div>
    <div style={{height:8}}/>
    <SimpleTable rows={[...ledgerFile as any, ...localLedger as any]}/>
  </div>)
}
