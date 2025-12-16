import { useState } from 'react';
import { grupoService } from '../../services/grupoService';
import './grupo.css'; 

export default function GrupoModal({ isOpen, onClose, user, atualizarUsuario }) {
  const [modo, setModo] = useState('entrar'); // 'entrar' ou 'criar'
  const [formData, setFormData] = useState({ nome: '', codigo: '', descricao: '' });
  const [mensagem, setMensagem] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Controle da página do slide (0 = Info, 1 = Membros)
  const [paginaAtual, setPaginaAtual] = useState(0);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensagem('');

    try {
      let resultado;
      if (modo === 'criar') {
        resultado = await grupoService.criarGrupo({
          nome: formData.nome,
          descricao: formData.descricao,
          usuarioId: user.id
        });
      } else {
        resultado = await grupoService.entrarGrupo(formData.codigo, user.id);
      }

      if (resultado.grupo) {
        setMensagem('✅ Sucesso!');
        setTimeout(() => {
            atualizarUsuario(); 
            onClose();
        }, 1500);
      } else {
        setMensagem(`❌ ${resultado.message}`);
      }
    } catch (error) {
      setMensagem('❌ Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  /* sair do grupo */
  const handleSair = async () => {
    if(!window.confirm("Tem certeza que deseja sair do grupo?")) return;
    
    setLoading(true);
    try {
        const response = await fetch('http://localhost:5001/api/grupos/sair', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            // Envia exatamente o que o backend espera: usuarioId
            body: JSON.stringify({ 
                usuarioId: user.id 
            })
        });

        const data = await response.json();

        if (response.ok) {
            setMensagem('✅ Você saiu do grupo.');
            setTimeout(() => {
                atualizarUsuario(); 
                setPaginaAtual(0); // Reseta para a primeira página
                onClose(); // Fecha o modal após sair
            }, 1500);
        } else {
            setMensagem(`❌ ${data.message || 'Erro ao sair.'}`);
        }
    } catch (error) {
        console.error("Erro ao sair:", error);
        setMensagem('❌ Erro de conexão com o servidor.');
    } finally {
        setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (user.grupo && user.grupo.codigo) {
      navigator.clipboard.writeText(user.grupo.codigo);
      alert(`Código ${user.grupo.codigo} copiado!`);
    }
  };

  // Garante que a lista de membros existe para evitar erros
  const listaMembros = (user.grupo && user.grupo.membros) ? user.grupo.membros : [];

  return (
    <div className="grupo-modal-overlay">
      <div className="grupo-modal-content">
        <button className="close-btn" onClick={onClose}>×</button>
        
        {/* === CENÁRIO 1: USUÁRIO JÁ TEM GRUPO === */}
        {user.grupo ? (
          <div className="meu-grupo-info">
            <h2>Meu Grupo</h2>
            
            <div className="grupo-card">
              <h3>{typeof user.grupo === 'object' ? user.grupo.nome : 'Grupo Ativo'}</h3>

              {/* pagina inicial = infos gerais */}
              {paginaAtual === 0 && (
                <div className="slide-fade-in">
                    <p className="pontuacao-destaque">🏆 Pontos Totais: {user.grupo.pontuacaoTotal || 0}</p>
                    
                    <div 
                        className="codigo-box" 
                        onClick={handleCopyCode}
                        title="Clique para copiar o código"
                    >
                        <p>Código de Convite:</p>
                        <strong className="codigo-texto">
                            {user.grupo.codigo || '...'}
                        </strong>
                        <span className="copiar-hint">📋 Copiar</span>
                    </div>
                    
                    <p className="aviso">Complete tarefas para subir o ranking do seu time!</p>

                    <button 
                        onClick={handleSair} 
                        disabled={loading}
                        className="btn-sair-grupo"
                    >
                        {loading ? 'Saindo...' : 'Sair do Grupo'}
                    </button>
                </div>
              )}

              {/* pagina final = lista com até 5 membros */}
              {paginaAtual === 1 && (
                <div className="slide-fade-in">
                    <p className="subtitulo-membros">👥 Membros ({listaMembros.length}/5)</p>
                    
                    <ul className="lista-membros-scroll">
                        {listaMembros.length > 0 ? (
                            listaMembros.map((membro) => (
                                <li key={membro._id || Math.random()} className="membro-item">
                                    <div className="membro-infos">
                                        <span className="membro-nome">
                                            {membro.nome} 
                                            {/* Verifica quem é o líder para colocar a coroa */}
                                            {user.grupo.lider === membro._id ? ' 👑' : ''}
                                        </span>
                                        <span className="membro-pts">{membro.capibas || 0} pts</span>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <p style={{fontSize: '0.9rem', color: '#777'}}>Não foi possível carregar os membros.</p>
                        )}
                    </ul>
                </div>
              )}

              {/* paginação */}
              <div className="pagination-dots">
                <span 
                    className={`dot ${paginaAtual === 0 ? 'active' : ''}`} 
                    onClick={() => setPaginaAtual(0)}
                ></span>
                <span 
                    className={`dot ${paginaAtual === 1 ? 'active' : ''}`} 
                    onClick={() => setPaginaAtual(1)}
                ></span>
              </div>

            </div>
          </div>
        ) : (
            
          /* usuario sem grupo */
          <div className="forms-container">
            <h2>Junte-se a um Grupo</h2>
            
            <div className="abas">
              <button 
                className={modo === 'entrar' ? 'active' : ''} 
                onClick={() => setModo('entrar')}
              >Entrar</button>
              <button 
                className={modo === 'criar' ? 'active' : ''} 
                onClick={() => setModo('criar')}
              >Criar Novo</button>
            </div>

            <form onSubmit={handleSubmit}>
              {modo === 'criar' ? (
                <>
                  <input 
                    type="text" 
                    placeholder="Nome do Grupo" 
                    required 
                    onChange={e => setFormData({...formData, nome: e.target.value})}
                  />
                  <textarea 
                    placeholder="Descrição do grupo..." 
                    onChange={e => setFormData({...formData, descricao: e.target.value})}
                  />
                </>
              ) : (
                <input 
                  type="text" 
                  placeholder="#Código do Grupo (ex: #A3F9)" 
                  required 
                  onChange={e => setFormData({...formData, codigo: e.target.value})}
                />
              )}

              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? 'Processando...' : (modo === 'criar' ? 'Criar Grupo' : 'Entrar no Grupo')}
              </button>
            </form>
          </div>
        )}
        
        {mensagem && <p className="msg-feedback">{mensagem}</p>}
      </div>
    </div>
  );
}