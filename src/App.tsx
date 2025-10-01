
import React from 'react'
import { NavLink, Routes, Route } from 'react-router-dom'
import C0 from './pages/C0'
import C1 from './pages/C1'
import C4 from './pages/C4'
import './styles/tokens.css'

export default function App(){
  return (
    <div>
      <div className='nav'>
        <NavLink to='/' end className={({isActive})=>isActive?'active':''}>C0 지휘소</NavLink>
        <NavLink to='/growth' className={({isActive})=>isActive?'active':''}>C1 유입</NavLink>
        <NavLink to='/rewards' className={({isActive})=>isActive?'active':''}>C4 보상엔진</NavLink>
      </div>
      <Routes>
        <Route path='/' element={<C0/>}/>
        <Route path='/growth' element={<C1/>}/>
        <Route path='/rewards' element={<C4/>}/>
      </Routes>
    </div>
  )
}
