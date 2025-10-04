
import React from 'react'
import Papa from 'papaparse'

type Rule = { name:string, required:string[] }

const RULES: Rule[] = [
  {name:'kpi_daily.csv', required:['date','channel','visits','clicks','carts','orders','revenue','ad_cost','returns','reviews']},
  {name:'creative_results.csv', required:['date','creative_id','impressions','clicks','spend','orders','revenue']},
  {name:'ledger.csv', required:['date','quest_id','type','stable_amt','edge_amt','lock_until','proof_url']},
]

export default function Tools(){
  const [msgs,setMsgs]=React.useState<string[]>([])

  function onFile(e:React.ChangeEvent<HTMLInputElement>){
    const file = e.target.files?.[0]
    if(!file) return
    Papa.parse(file, {
      header: true,
      complete: (res)=>{
        const headers = res.meta.fields || []
        const fileName = file.name
        const rule = RULES.find(r=>r.name===fileName)
        if(!rule){ setMsgs(m=>[`${fileName}: 규칙 미지정(확인 필요)` , ...m]); return }
        const missing = rule.required.filter(h=> !headers.includes(h))
        if(missing.length>0) setMsgs(m=>[`${fileName}: 누락 열 → ${missing.join(', ')}`, ...m])
        else setMsgs(m=>[`${fileName}: OK (열 구성 일치)`, ...m])
      }
    })
  }

  return (<div className='container'>
    <div className='card'><b>CSV 검사기</b>
      <div className='hint'>파일을 선택하면 헤더가 규격과 일치하는지 검사합니다.</div>
      <div className='row' style={{marginTop:8}}>
        <input type='file' className='input' onChange={onFile} accept='.csv'/>
      </div>
    </div>
    <div className='card'>
      <b>결과</b>
      <ul>
        {msgs.map((m,i)=>(<li key={i} className={m.includes('OK')?'ok':'err'}>{m}</li>))}
      </ul>
    </div>
  </div>)
}
