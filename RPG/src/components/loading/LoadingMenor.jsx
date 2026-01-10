import Particulas from "../particulas/Particulas";
import "./loading.css";

const LoadingMenor = () => {
  return (
    <div id="loading-menor">
      <div className="loading-content">
        <Particulas />
        <div className="loading-spinner"></div>
        <h1 className="loading-text">Carregando...</h1>
      </div>
    </div>
  );
}

export default LoadingMenor