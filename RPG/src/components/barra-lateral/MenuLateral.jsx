import { useState } from "react";
import "./barra-lateral.css"; 
import GrupoModal from "../grupos/GrupoModal"; 
import RankingModal from "../grupos/RankingModal"; 
import { authService } from "../../services/authService";

export default function MenuLateral({ isOpen, onClose, user, atualizarUsuario }) {
  const [isGrupoModalOpen, setIsGrupoModalOpen] = useState(false);
  const [isRankingModalOpen, setIsRankingModalOpen] = useState(false);

  if (!isOpen) return null;

  const handleLogout = () => {
    authService.logout();
    window.location.reload();
  };

  return (
    <>
      <div 
        className="overlay-backdrop"
        onClick={onClose}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 9998
        }}
      />

      <div className="sidebar" style={{ zIndex: 9999 }}>
        
        <div className="header">
          <h3>Menu Principal</h3>
          <button className="closeButton" onClick={onClose}>&times;</button>
        </div>

        <div className="sidebar-content">
          
          {/* Perfil do Usuário */}
          {user ? (
            <div className="infoBox" style={{ borderLeftColor: '#1449c0', marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 5px 0', fontSize: '1.1rem', color: '#1449c0' }}>{user.nome}</h4>
              <p style={{ margin: 0, color: '#666' }}>{user.email}</p>
              <div style={{ marginTop: '10px', display: 'flex', gap: '15px', fontWeight: 'bold' }}>
                <span style={{ color: '#d97706' }}>💰 {user.capibas || 0}</span>
                <span style={{ color: '#2f7854' }}>✅ {user.tarefasCompletas || 0}</span>
              </div>
            </div>
          ) : (
            <div className="infoBox">
              <p>Você não está logado.</p>
            </div>
          )}

          {/* Botões de Navegação */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            
            <button 
              className="updateButton" 
              onClick={() => setIsGrupoModalOpen(true)}
              style={{ width: '100%', justifyContent: 'flex-start', padding: '15px' }}
            >
              {user && user.grupo 
                ? 'Visualizar Meu Grupo' 
                : 'Entrar/Criar Grupos'}
            </button>

            {/* Botão do Ranking */}
            <button 
              className="saveButton"
              onClick={() => setIsRankingModalOpen(true)}
              style={{ width: '100%', justifyContent: 'flex-start', padding: '15px' }}
            >
              🏆 Ver Ranking Global
            </button>

            {user && (
              <button 
                className="deleteButton"
                onClick={handleLogout}
                style={{ width: '100%', justifyContent: 'flex-start', padding: '15px', marginTop: '20px' }}
              >
                Sair da Conta
              </button>
            )}
          </div>
        </div>

        <div style={{ marginTop: 'auto', textAlign: 'center', padding: '20px', color: '#ccc', fontSize: '0.8rem' }}>
          Recife Point Game &copy; 2025
        </div>
      </div>

      {/* Modal do Grupo */}
      <GrupoModal 
        isOpen={isGrupoModalOpen} 
        onClose={() => setIsGrupoModalOpen(false)} 
        user={user || {}}
        atualizarUsuario={atualizarUsuario}
      />

      {/* Modal do Ranking (CORRIGIDO AQUI) */}
      {isRankingModalOpen && (
        <RankingModal 
            isOpen={isRankingModalOpen}
            onClose={() => setIsRankingModalOpen(false)}
        />
      )}

    </>
  );
}