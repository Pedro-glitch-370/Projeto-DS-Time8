import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useState } from 'react'
import L from 'leaflet'

//pra evitar problemas de caminho
delete L.Icon.Default.prototype._getIconUrl;

//URLs corretas dos ícones dos pinos
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function Mapa() {
  //local e popUp de cada pino
  const pinos = [
    {
      id: 1, 
      coord: [-8.069600, -34.888016],
      msg: "Pintar e Renovar Quadra Campo dos Coelhos",
      titulo: "Quadra Campo dos Coelhos",
      recompensa: <strong>Recompensa: xx Capibas</strong>
    },
    {
      id: 2,
      coord: [-8.061921, -34.901674],
      msg: "Criar área simples de lazer",
      titulo: "Área de Lazer",
      recompensa: <strong>Recompensa: xx Capibas</strong>
    },
    {
      id: 3,
      coord: [-8.057035, -34.900528],
      msg: "Pintar e Renovar Campo na Praça do Derby",
      titulo: "Campo na Praça do Derby",
      recompensa: <strong>Recompensa: xx Capibas</strong>
    },
    {
      id: 4,
      coord: [-8.072237, -34.925757],
      msg: "Realizar Mural em Escola Municipal",
      titulo: "Escola Municipal",
      recompensa: <strong>Recompensa: xx Capibas</strong>
    }
  ]

  //retorna mapa e cada pino
  return (
    <>
    <MapContainer center={[-8.063, -34.871]} zoom={13} scrollWheelZoom={false}
                  style={{ height: '100vh', width: '100%' }}>
        
        <TileLayer
            url="https://tile.jawg.io/jawg-terrain/{z}/{x}/{y}{r}.png?access-token=txyn1dkLKLyeAVZpRphN9bgMLMXyX4ID2M7twL0qufk633O6XjmXLC2W54qmibZF"
        />

        {pinos.map(pino => (
          //renderiza cada pino em sua posição junto com sua mensagem
          <Marker key={pino.id} position={pino.coord}>
            <Popup>
              <div style={{ textAlign: 'center' }}>
                <h3>📍 {pino.titulo}</h3>

                {/*upload da foto*/}
                <label htmlFor={`foto-${pino.id}`}
                       style={{ cursor: 'pointer', padding: '10px',
                                backgroundColor: '#eee', borderRadius: '5px',
                                display: 'inline-block'}}>
                  Enviar Foto
                </label>
                <input type="file" id={`foto-${pino.id}`} accept='image/*' title='Enviar Foto'
                       style={{ display: 'none' }}/>
        
                {/*descrição da atividade e recompensa*/}
                <p>{pino.msg}</p>
                <p>{pino.recompensa}</p>

                {/*botão de confirmação*/}
                <button style={{ cursor: 'pointer' }}>Confirme sua presença</button>

              </div>
            </Popup>
          </Marker>
        ))}

    </MapContainer>
    </>
  )
}
