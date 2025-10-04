// src/pages/Data.tsx
import React from 'react'
import { loadCSV } from '../lib/csv'

type MapRec = Record<string, string>
const FILES = [
  'settings.csv',
  'kpi_daily.csv',
  'creative_results.csv',
  'ledger.csv',
  'rebalance_log.csv',
  'commerce_items.csv',
  'returns.csv'
]

function Hint(){ return <div className='hint'>
  ① 구글드라이브는 <b>링크 공유</b> 켜고 URL을 붙여넣으면 자동으로 Direct 링크로 변환합니다.<br/>
  ② 드롭박스는 <code>?dl=1</code>로 자동 변환합니다.<br/>
  ③ 저장 후, 각 화면(C0/C2/C4/C5)을 열면 최신 CSV를 원격에서 불러옵니다.
</div> }

export default function Data(){
  const [map,setMap]=React.useState<MapRec>({})
  const [status,setStatus]=React.useState<string>('')

  React.useEffect(()=>{
    const raw = localStorage.getItem('zp_data_sources')
    setMap(raw? JSON.parse(raw): {})
  },[])

  function save(){
    localStorage.setItem('zp_data_sources', JSON.stringify(map))
    setStatus('저장 완료. 새로고침 후 원격 CSV를 사용합니다.')
    setTimeout(()=>setStatus(''), 3000)
  }
  async function testOne(name:string){
    setStatus('테스트 중...')
    try{
      const rows = await loadCSV('/src/data/'+name)
      setStatus(`${name}: ${rows.length}행 확인`)
    }catch{
      setStatus(`${name}: 로드 실패`)
    }
  }
  function setVal(name:string, val:string){
    setMap(prev=> ({...prev, [name]: val}))
  }
  function reset(){
    localStorage.removeItem('zp_data_sources')
    setMap({})
    setStatus('원격 매핑 초기화')
  }

  return (<div className='container'>
    <div className='card'>
      <b>데이터 파이프(반자동)</b>
      <Hint/>
    </div>

    {FILES.map(f=>(
      <div className='card' key={f}>
        <div style={{display:'flex', gap:8, alignItems:'center'}}>
          <div style={{minWidth:160, fontWeight:600}}>{f}</div>
          <input style={{flex:1}} placeholder='Drive/Dropbox 공유 링크 또는 비워두기' value={map[f]||''} onChange={e=>setVal(f, (e.target as HTMLInputElement).value)} />
          <button className='badge' onClick={()=>testOne(f)}>테스트</button>
        </div>
      </div>
    ))}

    <div className='badges' style={{marginTop:8}}>
      <button className='badge success' onClick={save}>저장</button>
      <button className='badge warn' onClick={reset}>초기화</button>
    </div>
    {status && <div className='hint' style={{marginTop:8}}>{status}</div>}
  </div>)
}
