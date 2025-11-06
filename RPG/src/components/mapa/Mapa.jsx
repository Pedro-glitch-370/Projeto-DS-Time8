import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import L from "leaflet";

// Pra evitar problemas de caminho
delete L.Icon.Default.prototype._getIconUrl;

// URLs corretas dos ícones dos pinos
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Componente propriamente dito
export default function Mapa() {

  const [pinos, setPinos] = useState([]); // Array para armazenar os pinos do backend
  const [loading, setLoading] = useState(true); // Controla o estado de carregamento

  // useEffect serve pra lidar com efeitos colaterais em componentes funcionais
  useEffect(() => {
    // Função pra buscar os pinos da API
    const fetchPinos = async () => {
      try {
        console.log("🔄 Buscando pinos do backend...");

        // Faz a requisição para a API do backend
        const response = await fetch("http://localhost:5000/api/pinos");
        // Converte a resposta para JSON
        const data = await response.json();

        console.log("✅ Pinos carregados:", data);
        // Atualiza o estado com os pinos recebidos
        setPinos(data);
      } catch (err) {
        // Se a requisição falhar
        console.error("❌ Erro ao buscar pinos:", err);
        console.log("⚠️ Usando pinos de fallback...");

        // Quando o backend não está disponível
        setPinos([
          {
            id: 99,
            coord: [-8.0696, -34.888016], // Coordenadas
            msg: "Pintar e Renovar Quadra Campo dos Coelhos",
            titulo: "Quadra Campo dos Coelhos (Offline)",
          },
        ]);
      } finally {
        // Sempre acontece, é pra finaliza o estado de carregamento
        setLoading(false);
      }
    };

    // Chama a função e só é executado uma única vez graças ao []
    fetchPinos();
  }, []);

  // Renderiza o estado de carregamento
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "18px",
        }}
      >
        🗺️ Carregando mapa...
      </div>
    );
  }

  // Retorna mapa e cada pino
  return (
    <>
      <MapContainer
        center={[-8.063, -34.871]}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: "100vh", width: "100%" }}
      >
        <TileLayer url="https://tile.jawg.io/jawg-terrain/{z}/{x}/{y}{r}.png?access-token=txyn1dkLKLyeAVZpRphN9bgMLMXyX4ID2M7twL0qufk633O6XjmXLC2W54qmibZF" />

        {pinos.map((pino) => (
          // Renderiza cada pino em sua posição junto com sua mensagem
          <Marker key={pino.id} position={pino.coord}>
            <Popup>
              <div
                style={{
                  textAlign: "center",
                  color: "darkblue",
                }}
              >
                <h3>📍 {pino.titulo}</h3>

                {/*Upload da foto*/}
                <label
                  htmlFor={`foto-${pino.id}`}
                  style={{
                    width: "40px",
                    cursor: "pointer",
                    padding: "40px",
                    backgroundColor: "#ffffffff",
                    borderRadius: "20px",
                    borderStyle: "dotted",
                    borderColor: "darkblue",
                    display: "inline-block",
                  }}
                >
                  Enviar Foto
                </label>
                <input
                  type="file"
                  id={`foto-${pino.id}`}
                  accept="image/*"
                  title="Enviar Foto"
                  style={{ display: "none" }}
                />

                {/*Descrição da atividade e recompensa*/}
                <p>{pino.msg}</p>
                <p>
                  <strong>{pino.recompensa}</strong>
                </p>

                {/*Botão de confirmação */}
                <button
                  style={{
                    opacity: "50%",
                    cursor: "pointer",
                    color: "darkblue",
                    borderColor: "darkblue",
                    borderRadius: "5px",
                    padding: "8px",
                  }}
                >
                  Confirme sua presença
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </>
  );
}
