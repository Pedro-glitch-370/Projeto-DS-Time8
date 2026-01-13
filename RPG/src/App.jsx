import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthPopupProvider } from './context/AuthPopupContext.jsx';
import { UserProvider } from './context/UserContext.jsx';
import Redirect from './context/Redirect.jsx';
import Mapa from './components/mapa/Mapa.jsx'
import TarefasCarrossel from './components/tarefas/tarefasCarrossel/TarefasCarrossel.jsx';
import Navbar from './components/barra-superior/navbar/Navbar.jsx';
import GerenciarUsers from './components/gerenciar-usuarios/GerenciarUsers.jsx';
import Temporadas from './components/configurar-temporadas/Temporadas.jsx';
import Tutorial from './components/tutorial/Tutorial.jsx';
import Inicio from './components/inicio/Inicio.jsx';
import './css/App.css'

export default function App() {
  return (
    <BrowserRouter>
      <AuthPopupProvider>
        <UserProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/mapa" element={<Mapa />} />
            <Route path="/tarefas" element={<Redirect> <TarefasCarrossel /> </Redirect>} />
            <Route path="/tutorial" element={<Tutorial />} />
            <Route path="/gerenciar" element={<Redirect> <GerenciarUsers /> </Redirect>} />
            <Route path='/temporadas' element={<Redirect> <Temporadas /> </Redirect>} />
          </Routes>
        </UserProvider>
      </AuthPopupProvider>
    </BrowserRouter>
  )
}