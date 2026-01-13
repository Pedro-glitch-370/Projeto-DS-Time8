import { useState, useEffect } from "react";
import GrupoModal from "../../grupos/GrupoModal"; 
import RankingModal from "../../grupos/RankingModal"; 
import { authService } from "../../../services/authService";
import "../../barra-superior/menu/settingsMenu.css";

export default function MenuLateral({ isOpen, onClose, user, atualizarUsuario }) {
  const [isGrupoModalOpen, setIsGrupoModalOpen] = useState(false);
  const [isRankingModalOpen, setIsRankingModalOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  const handleLogout = () => {
    authService.logout();
    window.location.reload();
  };

  function handleClose() {
    setVisible(false);
    const timeout = setTimeout(() => {
      onClose();
    }, 300);
    return () => clearTimeout(timeout);
  }

  if (!isOpen) return null;

  return (
    <>
      {/* Modal do Grupo */}
      <GrupoModal 
        isOpen={isGrupoModalOpen} 
        onClose={() => setIsGrupoModalOpen(false)} 
        user={user || {}}
        atualizarUsuario={atualizarUsuario}
      />

      {/* Modal do Ranking */}
      {isRankingModalOpen && (
        <RankingModal 
            isOpen={isRankingModalOpen}
            onClose={() => setIsRankingModalOpen(false)}
        />
      )}

      <div className="settings-overlay" onClick={handleClose}>

        <div
          className={`settings-menu ${visible ? "open" : ""}`}
          onClick={(e) => e.stopPropagation()}
        >
          
          <div className="settings-header" style={{ marginBottom: '15px' }}>
            <h3>🏠 Menu Principal</h3>
            <button className="closeButton" onClick={handleClose}>&times;</button>
          </div>

          <div className="settings-menu-content">

            {/* Perfil do Usuário */}
            {user ? (
              <div className="infoBox-menuLat">
                <h4>{user.nome}</h4>
                <p>{user.email}</p>
                <div className="infoBox-menuLat-div">
                  <span style={{ color: '#d97706' }}>💰 {user.capibas || 0}</span>
                  <span style={{ color: '#2f7854' }}>✅ {user.tarefasCompletas || 0}</span>
                </div>
              </div>
            ) : (
              <div className="infoBox-menuLat">
                <p>Você não está logado.</p>
              </div>
            )}
            
            {/* Botões de Navegação */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {user && (
                <button 
                className="settings-option" 
                onClick={() => setIsGrupoModalOpen(true)}
                >
                  {user.grupo 
                    ? '👥 Visualizar Meu Grupo' 
                    : '👥 Entrar/Criar Grupos'}
                </button>)
              }

              {/* Botão do Ranking */}
              <button 
                className="settings-option"
                onClick={() => setIsRankingModalOpen(true)}
              >
                🏆 Ver Ranking Municipal
              </button>
              
              {user && (
                <button 
                  className="settings-option"
                  onClick={handleLogout}
                >
                  ↩ Sair da Conta
                </button>
              )}
            </div>
          </div>

          <div className="copyright">
            Recife Point Game &copy; 2025
          </div>
        </div>
      </div>

    </>
  );
}