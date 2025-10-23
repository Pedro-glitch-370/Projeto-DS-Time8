import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

export default function Mapa() {
  //local e popUp de cada pino
  const pinos = [
    {
      coord: [-8.069600, -34.888016],
      msg: "Pintar Quadra Campo dos Coelhos"
    },
    {
      coord: [-8.061921, -34.901674],
      msg: "Criar área simples de lazer"
    },
    {
      coord: [-8.057035, -34.900528],
      msg: "Pintar campo na Praça do Derby"
    },
    {
      coord: [-8.076426, -34.930399],
      msg: "Criar área simples de lazer"
    },
    {
      coord: [-8.085939, -34.886663],
      msg: "Criar área simples de lazer"
    },
    {
      coord: [-8.072237, -34.925757],
      msg: "Mural em Escola Municipal"
    }
  ]

  //retorna mapa e cada pino
  return (
    <>
    <MapContainer center={[-8.06, -34.87]} zoom={13} scrollWheelZoom={false}
                  style={{ height: '100vh', width: '100%' }}>
        
        <TileLayer
            attribution="Jawg.Terrain"
            url="https://tile.jawg.io/jawg-terrain/{z}/{x}/{y}{r}.png?access-token=txyn1dkLKLyeAVZpRphN9bgMLMXyX4ID2M7twL0qufk633O6XjmXLC2W54qmibZF"
        />

        {pinos.map(pino => (
          //renderiza cada pino em sua posição junto com sua mensagem
          <Marker position={pino.coord}>
            <Popup>{pino.msg}</Popup>
          </Marker>
        ))}

    </MapContainer>
    </>
  )
}
