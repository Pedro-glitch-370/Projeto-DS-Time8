import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './css/index.css'
import App from './App.jsx'

// Marca que é uma React App para a navbar não carregar automaticamente
window.isReactApp = true;

// Carrega a navbar e depois o React
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);