// src/components/StatusLocalizacao.jsx
import { useState, useEffect } from 'react';

/**
 * Componente de status de localização - mostra permissões, qualidade do GPS e controles
 * Exibe para todos os usuários (admins e clientes)
 */
export default function StatusLocalizacao({ 
  permissao,        // Boolean: usuário concedeu permissão de localização
  isAdmin,          // Boolean: usuário é administrador
  rastreamentoAtivo, // Boolean: rastreamento GPS ativo no momento
  precisao,         // Number: precisão do GPS em metros
  onReiniciar       // Function: callback para reiniciar localização
}) {
  const [mostrar, setMostrar] = useState(true);

  // Auto-esconde mensagens de sucesso após 5 segundos
  useEffect(() => {
      const timer = setTimeout(() => setMostrar(false), 5000);
      return () => clearTimeout(timer);
  }, []);

  // Calcula qualidade do GPS baseada na precisão
  const getQualidadeGPS = (precisao) => {
    if (!precisao) return { texto: '', cor: '#6c757d' };
    if (precisao < 0.01) return { texto: 'Excelente', cor: '#28a745' };
    if (precisao < 0.05) return { texto: 'Boa', cor: '#ffc107' };
    if (precisao < 0.10) return { texto: 'Regular', cor: '#fd7e14' };
    return { texto: 'Ruim', cor: '#dc3545' };
  };

  const qualidadeGPS = getQualidadeGPS(precisao);

  // Helpers para determinar estilo baseado no estado
  const getStatusClass = () => {
    if (!permissao) return 'negada';
    if (rastreamentoAtivo) return 'com-rastreamento';
    return 'permitida';
  };

  const getStatusIcon = () => {
    if (!permissao) return '❌';
    if (rastreamentoAtivo) return '🎯';
    return '📍';
  };

  const getStatusTitle = () => {
    if (!permissao) return 'Localização necessária';
    if (rastreamentoAtivo) return 'Localização ativa';
    return 'Localização permitida';
  };

  return (
    <div className={`status-localizacao ${getStatusClass()} ${!mostrar ? 'saindo' : ''}`}>
      {/* Ícone do status */}
      <div className="status-icon">
        {getStatusIcon()}
      </div>
      
      {/* Conteúdo principal */}
      <div className="status-content">
        <div className="status-title">
          {getStatusTitle()}
          {isAdmin && <span className="admin-badge">👑 Admin</span>}
        </div>
        
        {/* Informações de precisão do GPS (apenas quando rastreamento ativo) */}
        {permissao && rastreamentoAtivo && precisao && (
          <div className="status-info">
            <div>Precisão: ~{Math.round(precisao)}m</div>
            {qualidadeGPS.texto && (
              <div className="qualidade-gps" style={{ color: qualidadeGPS.cor }}>
                {qualidadeGPS.texto}
              </div>
            )}
          </div>
        )}
        
        {/* Botão para atualizar localização */}
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
      
      {/* Botão para fechar manualmente */}
      {(<button 
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