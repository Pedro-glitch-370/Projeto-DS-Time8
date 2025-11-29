// src/components/StatusLocalizacao.jsx
import { useState, useEffect } from 'react';

/**
 * Componente que mostra o status da localização do usuário
 * AGORA MOSTRA PARA TODOS OS USUÁRIOS (ADMINS E CLIENTES)
 */
export default function StatusLocalizacao({ 
  permissao, 
  mensagem, 
  isAdmin, 
  rastreamentoAtivo, 
  precisao,
  onReiniciar 
}) {
  const [mostrar, setMostrar] = useState(true);

  // Esconde automaticamente após 5 segundos se for mensagem de sucesso
  useEffect(() => {
    if (mensagem && mensagem.includes('✅')) {
      const timer = setTimeout(() => {
        setMostrar(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [mensagem]);

  // ✅ REMOVEMOS A RESTRIÇÃO DE ADMIN - agora mostra para todos
  // Não mostra nada se não há mensagem e permissão é null (ainda não verificou)
  if (!mensagem && permissao === null) {
    return null;
  }

  if (!mostrar && mensagem && mensagem.includes('✅')) {
    return null;
  }

  // Determina a qualidade da localização baseada na precisão
  const getQualidadeGPS = (precisao) => {
    if (!precisao) return { texto: '', cor: '#6c757d' };
    if (precisao < 20) return { texto: 'Excelente', cor: '#28a745' };
    if (precisao < 50) return { texto: 'Boa', cor: '#ffc107' };
    if (precisao < 100) return { texto: 'Regular', cor: '#fd7e14' };
    return { texto: 'Ruim', cor: '#dc3545' };
  };

  const qualidadeGPS = getQualidadeGPS(precisao);

  // Determina a classe CSS baseada no estado
  const getStatusClass = () => {
    if (!permissao) return 'negada';
    if (rastreamentoAtivo) return 'com-rastreamento';
    return 'permitida';
  };

  // Determina o ícone baseado no estado
  const getStatusIcon = () => {
    if (!permissao) return '❌';
    if (rastreamentoAtivo) return '🎯';
    return '📍';
  };

  // Determina o título baseado no estado
  const getStatusTitle = () => {
    if (!permissao) return 'Localização necessária';
    if (rastreamentoAtivo) return 'Localização ativa';
    return 'Localização permitida';
  };

  return (
    <div className={`status-localizacao ${getStatusClass()} ${!mostrar ? 'saindo' : ''}`}>
      <div className="status-icon">
        {getStatusIcon()}
      </div>
      <div className="status-content">
        <div className="status-title">
          {getStatusTitle()}
          {isAdmin && <span className="admin-badge">👑 Admin</span>}
        </div>
        {mensagem && (
          <div className="status-message">
            {mensagem}
          </div>
        )}
        {permissao && rastreamentoAtivo && precisao && (
          <div className="status-info">
            <div>Precisão: ~{Math.round(precisao)}m</div>
            {qualidadeGPS.texto && (
              <div 
                className="qualidade-gps"
                style={{ color: qualidadeGPS.cor }}
              >
                {qualidadeGPS.texto}
              </div>
            )}
          </div>
        )}
        {permissao && !rastreamentoAtivo && onReiniciar && (
          <div className="status-actions">
            <button 
              className="status-btn"
              onClick={onReiniciar}
              title="Forçar atualização da localização"
            >
              🔄 Atualizar
            </button>
          </div>
        )}
      </div>
      {mensagem && (
        <button 
          className="status-close"
          onClick={() => setMostrar(false)}
          aria-label="Fechar"
        >
          ×
        </button>
      )}
    </div>
  );
}