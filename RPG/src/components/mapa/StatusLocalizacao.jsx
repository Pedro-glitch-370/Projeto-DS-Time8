// src/components/StatusLocalizacao.jsx
import { useState, useEffect } from 'react';

/**
 * Componente que mostra o status da localização do usuário
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

  // Não mostra nada para admins ou se não há mensagem e permissão
  if (isAdmin || (!mensagem && permissao === null)) {
    return null;
  }

  if (!mostrar && mensagem && mensagem.includes('✅')) {
    return null;
  }

  // Determina a classe CSS baseada no estado
  const getStatusClass = () => {
    if (!permissao) return 'negada';
    if (rastreamentoAtivo) return 'com-rastreamento';
    return 'permitida';
  };

  // Determina o ícone baseado no estado
  const getStatusIcon = () => {
    if (!permissao) return '❌';
    if (rastreamentoAtivo) return '📍';
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
        </div>
        {mensagem && (
          <div className="status-message">
            {mensagem}
          </div>
        )}
        {permissao && rastreamentoAtivo && precisao && (
          <div className="status-info">
            Precisão: ~{Math.round(precisao)}m
          </div>
        )}
        {permissao && !rastreamentoAtivo && onReiniciar && (
          <div className="status-actions">
            <button 
              className="status-btn"
              onClick={onReiniciar}
            >
              Atualizar
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