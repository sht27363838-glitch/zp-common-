
import React from 'react'
import { NavLink, Routes, Route } from 'react-router-dom'
import C0 from './pages/C0'
import C1 from './pages/C1'
import C2 from './pages/C2'
import C4 from './pages/C4'
import C6 from './pages/C6'
import './styles/tokens.css'

export default function App(){
  return (
    <div>
      <div className='nav'>
        <NavLink to='/' end className={({isActive})=>isActive?'active':''}>C0 지휘소</NavLink>
        <NavLink to='/growth' className={({isActive})=>isActive?'active':''}>C1 유입</NavLink>
        <NavLink to='/commerce' className={({isActive})=>isActive?'active':''}>C2 전환</NavLink>
        <NavLink to='/rewards' className={({isActive})=>isActive?'active':''}>C4 보상엔진</NavLink>
        <NavLink to='/experiments' className={({isActive})=>isActive?'active':''}>C6 실험</NavLink>
      </div>
      <Routes>
        <Route path='/' element={<C0/>}/>
        <Route path='/growth' element={<C1/>}/>
        <Route path='/commerce' element={<C2/>}/>
        <Route path='/rewards' element={<C4/>}/>
        <Route path='/experiments' element={<C6/>}/>
      </Routes>
    </div>
  )
}
