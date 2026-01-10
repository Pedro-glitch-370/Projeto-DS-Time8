import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthPopup, useUser } from "../../context/exportsContext";
import "./inicio.css";
import Particulas from "../particulas/Particulas";

export default function Inicio() {
  const navigate = useNavigate();
  const { setLoginPopupAberto } = useAuthPopup();
  const { usuarioLogado } = useUser();
  const [mostrarOpcoes, setMostrarOpcoes] = useState(false);

  useEffect(() => {
    if (usuarioLogado) {
      navigate("/mapa");
    } else {
      const timer = setTimeout(() => setMostrarOpcoes(true), 1500);
      return () => clearTimeout(timer);
    }}, [usuarioLogado, navigate]);

  return (
    <> 
      <div className="inicio-container">
        <Particulas />
        <div className="conteudo-central">
          <div className="logo-area">
            <img src="/src/assets/LogoConecta.png" alt="Logo" className="logo-inicio"/>
            <h1 className="titulo">Recife Point Game</h1>
          </div>

          {mostrarOpcoes && (
            <div className="botoes-area fade-in">
              <button className="botao" onClick={() => setLoginPopupAberto(true)}>
                Entrar numa conta
              </button>
              <button className="botao" onClick={() => navigate("/tutorial")}>
                Visualizar tutorial
              </button>
              <button className="botao" onClick={() => navigate("/mapa")}>
                Seguir sem conta
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
