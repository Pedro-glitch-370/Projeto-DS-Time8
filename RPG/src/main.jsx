import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

/* Importa o CSS e JS para a barra superior (top nav) */
import './components/barra-superior/barra-superior.css'
import './components/barra-superior/barra-superior-loader.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
