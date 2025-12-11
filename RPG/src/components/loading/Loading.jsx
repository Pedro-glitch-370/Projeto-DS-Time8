import { useEffect, useRef } from "react";
import "../../css/loading.css";

const Loading = () => {
  const particlesRef = useRef(null);

  useEffect(() => {
    const particlesContainer = particlesRef.current;
    const particleCount = 15;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      particle.className = "particle";

      const size = Math.random() * 10 + 5;
      const posX = Math.random() * 100;
      const posY = Math.random() * 100;
      const delay = Math.random() * 5;
      const duration = Math.random() * 3 + 3;

      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${posX}%`;
      particle.style.top = `${posY}%`;
      particle.style.animationDelay = `${delay}s`;
      particle.style.animationDuration = `${duration}s`;

      particlesContainer.appendChild(particle);
    }

    // Remover partículas quando desmontar
    return () => {
      particlesContainer.innerHTML = "";
    };
  }, []);

  return (
    <div id="loading">
      <div className="particles" id="particles" ref={particlesRef}></div>
      <div className="loading-content">
        <div className="logo-loading">
          <img src="\src\assets\LogoConecta.png" alt="Logo Conecta" />
        </div>
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
}

export default Loading