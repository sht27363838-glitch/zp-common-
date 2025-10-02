
import React from 'react'
export default function Donut({ratio,label}:{ratio:number,label:string}){
  const clamped = Math.max(0, Math.min(1, ratio))
  const size=140, stroke=16, r=(size-stroke)/2, c=2*Math.PI*r
  const filled = c*clamped
  return (
    <div className='card' style={{display:'flex',gap:16,alignItems:'center'}}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} stroke='var(--border)' strokeWidth={stroke} fill='none'/>
        <circle cx={size/2} cy={size/2} r={r} stroke='var(--accent)' strokeWidth={stroke} fill='none'
          strokeDasharray={`${filled} ${c}`} strokeLinecap='round' transform={`rotate(-90 ${size/2} ${size/2})`}/>
        <text x='50%' y='50%' dominantBaseline='middle' textAnchor='middle' fontSize='18' fontWeight='700'>{Math.round(clamped*100)}%</text>
      </svg>
      <div>
        <div style={{fontWeight:700}}>바벨 엣지 비중</div>
        <div className='hint'>{label}</div>
      </div>
    </div>
  )
}
