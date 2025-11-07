import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useState } from 'react'
import L from 'leaflet'
import api from'../../services/api'

// CORREÇÃO DOS ÍCONES DO LEAFLET NO REACT
// Remove a implementação padrão de ícones do Leaflet para evitar problemas de caminho
delete L.Icon.Default.prototype._getIconUrl

// Configura as URLs corretas para os ícones dos marcadores
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const recifeBounds = [
    [-8.200, -35.050], // Sudoeste (SW) - Ex: Cabo de Santo Agostinho (próximo) e limite oeste
    [-7.900, -34.800]  // Nordeste (NE) - Ex: Olinda (próximo) e limite leste (mar)
]


export default function Mapa() {
  // ESTADO DO COMPONENTE
  const [pinos, setPinos] = useState([]) // Array para armazenar os pinos do backend
  const [loading, setLoading] = useState(true) // Controla o estado de carregamento

  // EFEITO PARA BUSCAR OS PINOS DO BACKEND
  useEffect(() => {
    // Função assíncrona para buscar os pinos da API
    const fetchPinos = async () => {
      try {
        console.log('🔄 Buscando pinos do backend...')
        
        // Faz a requisição para a API do backend
        const response = await api.get('/pinos')
        // Converte a resposta para JSON
        
        console.log('✅ Pinos carregados:', response.data)
        // Atualiza o estado com os pinos recebidos
        setPinos(response.data)
        
      } catch (err) {
        // TRATAMENTO DE ERRO - Se a requisição falhar
        console.error('❌ Erro ao buscar pinos:', err)
        console.log('⚠️ Usando pinos de fallback...')
        
        // DADOS DE FALLBACK - Usado quando o backend não está disponível
        setPinos([
          {
            id: 99,
            coordinates: [-8.063149, -34.871139], // Coordenadas do Marco Zero no Recife
            msg: "Marco Zero - Backend offline, usando dados locais",
            nome: "Marco Zero (Offline)"
          }
        ])
      } finally {
        // SEMPRE executa - finaliza o estado de carregamento
        setLoading(false)
      }
    }

    // Chama a função para buscar os pinos
    fetchPinos()
  }, []) // Array de dependências vazio = executa apenas uma vez ao montar o componente

  // RENDERIZAÇÃO DO ESTADO DE CARREGAMENTO
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px' 
      }}>
        🗺️ Carregando mapa...
      </div>
    )
  }

  // RENDERIZAÇÃO PRINCIPAL DO MAPA
  return (
    // Container principal do mapa do Leaflet
    <MapContainer 
      center={[-8.063, -34.871]} // Posição inicial do mapa (Recife Antigo)
      zoom={15} // Nível de zoom inicial
      style={{ height: '100vh', width: '100%' }} // Ocupa toda a tela
      maxBounds={recifeBounds} // Limita a visualização do mapa aos limites do Brasil
      maxBoundsViscosity={1.0} // Impede que o usuário arraste o mapa para fora dos limites
      minZoom={13} // Usuário não pode afastar o mapa além do zoom 12
      maxZoom={18} // Usuário não pode aproximar o mapa além do zoom 18
    >
      {/* Camada de tiles (mapa de fundo) do OpenStreetMap */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* RENDERIZAÇÃO DINÂMICA DOS PINOS */}
      {pinos.map(pino => (
        // Marcador para cada pino no mapa
        <Marker key={pino.id} 
        position={[pino.localizacao.coordinates[1], pino.localizacao.coordinates[0]]}>
          {/* Popup que aparece ao clicar no marcador */}
          <Popup>
            <div>
              {/* Título do pino com emoji de localização */}
              <h3>📍 {pino.nome}</h3>
              {/* Mensagem/descrição do pino */}
              <p>{pino.msg}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
