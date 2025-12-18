import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Mapa from './components/mapa/Mapa.jsx'
import TarefasCarrossel from './components/tarefas/tarefasCarrossel/TarefasCarrossel.jsx';
import Navbar from './components/barra-superior/navbar/Navbar.jsx';
import GerenciarUsers from './components/gerenciar-usuarios/GerenciarUsers.jsx';
import Temporadas from './components/configurar-temporadas/Temporadas.jsx';
import Tutorial from './components/tutorial/Tutorial.jsx';
import './css/App.css'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Mapa />} />
        <Route path="/tarefas" element={<TarefasCarrossel />} />
        <Route path="/tutorial" element={<Tutorial />} />
        <Route path="/gerenciar" element={<GerenciarUsers />} />
        <Route path='/temporadas' element={<Temporadas />} />
      </Routes>
    </BrowserRouter>
  )
}