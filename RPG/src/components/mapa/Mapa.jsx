import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

export default function Mapa() {
  //local e popUp de cada pino
  const pinos = [
    {
      coord: [-8.065193, -34.890279],
      msg: "Local 1"
    },
    {
      coord: [-8.077771, -34.909829],
      msg: "Local 2"
    },
    {
      coord: [-8.041080, -34.875555],
      msg: "Local 3"
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
