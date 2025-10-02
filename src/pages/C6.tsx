
import React from 'react'
import { loadCSV } from '../lib/csv'
import { uplift, winner, safe } from '../lib/calc'
import { SimpleTable } from '../components/SimpleTable'
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

type Exp = { exp_id:string, hypothesis:string, metric:'CTR'|'CVR', control_impr:string, control_conv:string, variant_impr:string, variant_conv:string, start_date:string, end_date:string, decision:string, notes:string }

export default function C6(){
  const [rows,setRows]=React.useState<Exp[]>([])
  React.useEffect(()=>{ loadCSV('/src/data/experiments.csv').then((r:any)=>setRows(r)) },[])

  const table = rows.map(r=>{
    const ci = Number(r.control_impr||0), cc = Number(r.control_conv||0)
    const vi = Number(r.variant_impr||0), vc = Number(r.variant_conv||0)
    const rc = safe(cc,ci), rv = safe(vc,vi)
    const u = rc===0? 0 : (rv-rc)/rc
    const ok = (ci>=500 && vi>=500 && u>=0.10)
    return {
      EXP:r.exp_id,
      가설:r.hypothesis,
      지표:r.metric,
      표본:`C ${ci.toLocaleString()} / V ${vi.toLocaleString()}`,
      전환:`C ${cc.toLocaleString()} / V ${vc.toLocaleString()}`,
      uplift:`${(u*100).toFixed(1)}%`,
      판정: ok ? '승' : '패'
    }
  })

  const scatter = rows.map(r=>{
    const ci = Number(r.control_impr||0), cc = Number(r.control_conv||0)
    const vi = Number(r.variant_impr||0), vc = Number(r.variant_conv||0)
    const rc = safe(cc, ci), rv = safe(vc, vi)
    return { exp:r.exp_id, control: rc*100, variant: rv*100 }
  })

  return (<div className='container'>
    <div className='card'><b>Experiments — 승/패 & Uplift</b><div className='hint'>게이트: 각 표본 ≥ 500, uplift ≥ +10% → 승</div></div>
    <SimpleTable rows={table}/>

    <div style={{height:12}}/>

    <div className='card'><b>A/A vs A/B 분포(지표 %)</b></div>
    <div className='card' style={{height:320}}>
      <ResponsiveContainer>
        <ScatterChart>
          <CartesianGrid />
          <XAxis dataKey='control' name='Control %' tick={{fontSize:12}}/>
          <YAxis dataKey='variant' name='Variant %' tick={{fontSize:12}}/>
          <Tooltip cursor={{ strokeDasharray: '3 3' }}/>
          <Scatter name='실험' data={scatter} fill='var(--accent)' />
        </ScatterChart>
      </ResponsiveContainer>
      <div className='hint'>대각선 근처=A/A, 우상향=개선. 좌하=악화.</div>
    </div>
  </div>)
}
