// App.jsx
import Mapa from './components/mapa/Mapa.jsx'
import './css/App.css'

export default function App() {
  return (
    <div>
      {/* A navbar é carregada automaticamente pelo navbar.js */}
      <div className="mapa-container">
        <Mapa />
      </div>
    </div>
  )
}