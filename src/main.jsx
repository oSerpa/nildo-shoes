import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Vitrine from './pages/Vitrine'
import Admin from './admin/Admin'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Vitrine />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Vitrine />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
