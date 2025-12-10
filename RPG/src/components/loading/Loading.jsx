
import "../../css/loading.css";

const Loading = () => (
  <div id="loading">
    <div className="particles" id="particles"></div>
    <div className="loading-content">
      <div className="logo-loading">🎯</div>
      <div className="loading-spinner"></div>
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

export default Loading;
