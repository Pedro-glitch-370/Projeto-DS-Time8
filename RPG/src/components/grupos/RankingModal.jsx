import { useState, useEffect } from 'react';
import { grupoService } from '../../services/grupoService';
import './grupo.css';

export default function RankingModal({ isOpen, onClose }) {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  // Carrega o ranking toda vez que o modal abre
  useEffect(() => {
    if (isOpen) {
      carregarRanking();
    }
  }, [isOpen]);

  const carregarRanking = async () => {
    setLoading(true);
    setErro('');
    try {
      const dados = await grupoService.getRanking();
      setRanking(dados);
    } catch (error) {
      setErro('Não foi possível carregar o ranking: ', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="grupo-modal-overlay">
      <div className="grupo-modal-content" style={{ maxWidth: '500px' }}>
        <button className="close-btn" onClick={onClose}>×</button>
        
        <h2 style={{ color: '#d97706' }}>🏆 Top Clãs de Recife</h2>
        
        {loading && <p>Carregando placar...</p>}
        {erro && <p className="msg-feedback" style={{backgroundColor: '#ffebee', color: '#c62828'}}>{erro}</p>}

        {!loading && !erro && (
          <div className="ranking-lista" style={{ maxHeight: '400px', overflowY: 'auto', textAlign: 'left' }}>
            
            {ranking.length === 0 ? (
              <p style={{ textAlign: 'center' }}>Nenhum grupo pontuou ainda.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #eee', color: '#888', fontSize: '0.9rem' }}>
                    <th style={{ padding: '10px' }}>#</th>
                    <th style={{ padding: '10px' }}>Grupo</th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>Pontos</th>
                  </tr>
                </thead>
                <tbody>
                  {ranking.map((grupo, index) => (
                    <tr key={grupo._id} style={{ 
                      borderBottom: '1px solid #f0f0f0', 
                      backgroundColor: index < 3 ? '#fff9e6' : 'transparent', // Destaque para top 3
                      color: '#333'
                    }}>
                      <td style={{ padding: '12px', fontWeight: 'bold', fontSize: '1.1rem', color: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : '#666' }}>
                        {index + 1}º
                      </td>
                      <td style={{ padding: '12px' }}>
                        <strong style={{ display: 'block', fontSize: '1rem' }}>{grupo.nome}</strong>
                        <span style={{ fontSize: '0.8rem', color: '#777' }}>Líder: {grupo.lider ? grupo.lider.nome : 'Desconhecido'}</span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#1449c0' }}>
                        {grupo.pontuacaoTotal}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
        
        <button 
          onClick={onClose}
          style={{
            marginTop: '20px',
            background: '#eee',
            color: '#333',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '20px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Fechar Ranking
        </button>

      </div>
    </div>
  );
}