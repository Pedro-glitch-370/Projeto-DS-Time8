import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Loading from './components/loading/Loading.jsx'
import Mapa from './components/mapa/Mapa.jsx'
import TarefasCarrossel from './components/tarefas/TarefasCarrossel.jsx';
import Navbar from './components/barra-superior/Navbar.jsx';
import './css/App.css'

function Home() {
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    // Simula carregamento de dados
    setTimeout(() => setCarregando(false), 2000);
  }, []);

  return (
    <div>
      {/* A navbar é carregada automaticamente pelo navbar.js */}
      {/* tirei o <div className="mapa-container"> de Mapa por enquanto */}
      {carregando ? <Loading /> : <Mapa />}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tarefas" element={<TarefasCarrossel />} />
        <Route path="/capibas" element={<div>Capibas aqui</div>} />
      </Routes>
    </BrowserRouter>
  )
}