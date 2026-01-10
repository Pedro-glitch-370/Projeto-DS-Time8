import Particulas from "../particulas/Particulas";
import "./loading.css";

const Loading = () => {
  return (
    <div id="loading">
      <div className="loading-content">
        <Particulas />
        <div className="logo-loading">
          <img src="\src\assets\LogoConecta.png" alt="Logo Conecta" />
        </div>
        <h1 className="loading-text">Recife Point Game</h1>
        <p className="loading-subtext">
          Carregando sua aventura por Recife...
        </p>
        <div className="progress-bar">
          <div className="progress"></div>
        </div>
      </div>
    </div>
  );
}

export default Loading