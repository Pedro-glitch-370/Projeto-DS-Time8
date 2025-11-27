// Importar os serviços
import { pinoService } from '../services/pinoService.js'
import { clienteService } from '../services/clienteService.js';

// Variáveis globais
let tarefaAtual = null;
let botaoAtual = null;
let todasTarefas = [];
let usuarioLogado = null;
let tarefasConcluidas = [];

// Função para verificar se o usuário está logado
function verificarLogin() {
  const userData = localStorage.getItem('user');
  if (!userData) {
    alert('⚠️ Você precisa estar logado para acessar as tarefas!');
    window.location.href = 'login.html';
    return null;
  }
  
  try {
    const user = JSON.parse(userData);
    console.log('👤 Usuário logado:', user);
    return user;
  } catch (error) {
    console.error('Erro ao parsear dados do usuário:', error);
    window.location.href = 'login.html';
    return null;
  }
}

// Função para carregar dados do usuário
async function carregarDadosUsuario() {
  try {
    usuarioLogado = verificarLogin();
    if (!usuarioLogado) return;

    console.log('🔄 Carregando dados do usuário...');
    
    // Buscar dados atualizados do cliente
    // Tenta por ID primeiro, depois por email
    let cliente;
    try {
      cliente = await clienteService.getCliente(usuarioLogado.id);
    } catch (error) {
      console.log('Tentando buscar por email...');
      cliente = await clienteService.getClienteByEmail(usuarioLogado.email);
    }
    
    // Atualizar dados do usuário
    usuarioLogado.capibas = cliente.capibas || 0;
    usuarioLogado.tarefasCompletas = cliente.tarefasCompletas || 0;
    tarefasConcluidas = cliente.tarefasConcluidas || [];

    console.log('✅ Dados do usuário carregados:', {
      capibas: usuarioLogado.capibas,
      tarefasCompletas: usuarioLogado.tarefasCompletas,
      tarefasConcluidas: tarefasConcluidas.length
    });

    // Atualizar interface
    document.getElementById('userCapibas').textContent = usuarioLogado.capibas;
    document.getElementById('userTarefasCompletas').textContent = usuarioLogado.tarefasCompletas;
    
  } catch (error) {
    console.error('❌ Erro ao carregar dados do usuário:', error);
    // Usar dados do localStorage como fallback
    usuarioLogado.capibas = usuarioLogado.capibas || 0;
    usuarioLogado.tarefasCompletas = usuarioLogado.tarefasCompletas || 0;
    tarefasConcluidas = usuarioLogado.tarefasConcluidas || [];
    
    document.getElementById('userCapibas').textContent = usuarioLogado.capibas;
    document.getElementById('userTarefasCompletas').textContent = usuarioLogado.tarefasCompletas;
  }
}

// Função para carregar tarefas
async function carregarTarefas() {
  try {
    console.log('🔄 Carregando tarefas da API...');
    
    const pinos = await pinoService.getPinos();
    
    // Transformar pinos em tarefas
    todasTarefas = pinos.map(pino => ({
      id: pino._id,
      nome: pino.nome,
      descricao: pino.msg,
      recompensa: pino.capibas || 0,
      concluida: tarefasConcluidas.includes(pino._id)
    }));
    
    console.log(`✅ ${todasTarefas.length} tarefas carregadas`);
    console.log(`📊 Tarefas concluídas: ${todasTarefas.filter(t => t.concluida).length}`);
    
    exibirTarefas();
    
  } catch (error) {
    console.error('❌ Erro ao carregar tarefas:', error);
    document.getElementById('semTarefas').innerHTML = `
      <h3>❌ Erro ao carregar tarefas</h3>
      <p>Não foi possível carregar os pontos turísticos. Verifique se o servidor está rodando.</p>
      <button onclick="location.reload()" style="margin-top: 15px; padding: 10px 20px; background: #1449c0; color: white; border: none; border-radius: 5px; cursor: pointer;">
        Tentar Novamente
      </button>
    `;
  }
}

// Função para exibir tarefas na tela
function exibirTarefas() {
  const listaTarefas = document.getElementById('listaTarefas');
  const semTarefas = document.getElementById('semTarefas');
  
  if (todasTarefas.length === 0) {
    semTarefas.innerHTML = `
      <h3>📭 Nenhuma tarefa disponível</h3>
      <p>No momento não há pontos turísticos cadastrados. Volte mais tarde!</p>
    `;
    semTarefas.style.display = 'block';
    return;
  }
  
  semTarefas.style.display = 'none';
  
  // Criar HTML para cada tarefa
  listaTarefas.innerHTML = todasTarefas.map(tarefa => `
    <div class="tarefa-item ${tarefa.concluida ? 'tarefa-concluida' : ''}" id="tarefa-${tarefa.id}">
      <span class="status ${tarefa.concluida ? 'status-concluida' : 'status-pendente'}">
        ${tarefa.concluida ? '✅ Concluída' : '🔴 Pendente'}
      </span>
      <h3>${tarefa.nome}</h3>
      <p>${tarefa.descricao}</p>
      <p class="recompensa">🎯 Recompensa: ${tarefa.recompensa} capibas</p>
      <button class="btn-confirmar" 
        ${tarefa.concluida ? 'disabled' : ''}
        onclick="abrirPopupTarefa(this, ${tarefa.recompensa}, '${tarefa.nome.replace(/'/g, "\\'")}', '${tarefa.descricao.replace(/'/g, "\\'")}', '${tarefa.id}')">
        ${tarefa.concluida ? 'Tarefa Concluída' : 'Confirmar Conclusão'}
      </button>
    </div>
  `).join('');
}

// Função para abrir popup de confirmação
function abrirPopupTarefa(botao, capibas, local, descricao, id) {
  tarefaAtual = { capibas, local, descricao, id };
  botaoAtual = botao;
  
  document.getElementById('popupLocal').textContent = local;
  document.getElementById('popupCapibas').textContent = `${capibas} capibas`;
  document.getElementById('popupDescricao').textContent = descricao;
  
  document.getElementById('popupTarefa').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

// Função para fechar popup
function fecharPopupTarefa() {
  document.getElementById('popupTarefa').style.display = 'none';
  document.body.style.overflow = 'auto';
  tarefaAtual = null;
  botaoAtual = null;
}

// Função SIMPLIFICADA para concluir tarefa (usando localStorage como fallback)
async function concluirTarefa() {
  if (!tarefaAtual || !botaoAtual || !usuarioLogado) return;
  
  try {
    // Tentar salvar no backend
    try {
      const resultado = await clienteService.concluirTarefa(
        usuarioLogado.id, 
        tarefaAtual.id, 
        tarefaAtual.capibas
      );
      
      // Atualizar com dados do backend
      usuarioLogado.capibas = resultado.capibas;
      usuarioLogado.tarefasCompletas = resultado.tarefasCompletas;
      
    } catch (backendError) {
      console.warn('⚠️ Usando fallback localStorage:', backendError.message);
      
      // Fallback: salvar no localStorage
      usuarioLogado.capibas = (usuarioLogado.capibas || 0) + tarefaAtual.capibas;
      usuarioLogado.tarefasCompletas = (usuarioLogado.tarefasCompletas || 0) + 1;
      
      if (!usuarioLogado.tarefasConcluidas) {
        usuarioLogado.tarefasConcluidas = [];
      }
      usuarioLogado.tarefasConcluidas.push(tarefaAtual.id);
      
      // Salvar no localStorage
      localStorage.setItem('user', JSON.stringify(usuarioLogado));
    }

    // Atualizar interface
    const tarefaItem = botaoAtual.closest('.tarefa-item');
    const status = tarefaItem.querySelector('.status');
    
    status.textContent = '✅ Concluída';
    status.className = 'status status-concluida';
    
    botaoAtual.textContent = 'Tarefa Concluída';
    botaoAtual.disabled = true;
    tarefaItem.classList.add('tarefa-concluida');

    // Atualizar estatísticas
    document.getElementById('userCapibas').textContent = usuarioLogado.capibas;
    document.getElementById('userTarefasCompletas').textContent = usuarioLogado.tarefasCompletas;

    // Atualizar array local
    const tarefaIndex = todasTarefas.findIndex(t => t.id === tarefaAtual.id);
    if (tarefaIndex !== -1) {
      todasTarefas[tarefaIndex].concluida = true;
    }

    // Feedback visual
    tarefaItem.style.transform = 'scale(1.02)';
    setTimeout(() => {
      tarefaItem.style.transform = 'scale(1)';
    }, 200);

    // Mensagem de sucesso
    alert(`🎉 Parabéns! Você ganhou ${tarefaAtual.capibas} capibas!\n\n` +
          `💰 Total: ${usuarioLogado.capibas} capibas\n` +
          `✅ Tarefas completas: ${usuarioLogado.tarefasCompletas}`);

    // Fechar popup
    fecharPopupTarefa();

  } catch (error) {
    console.error('Erro ao concluir tarefa:', error);
    alert('❌ Erro ao concluir tarefa. Tente novamente.');
  }
}

// Event Listeners
document.getElementById('popupTarefa').addEventListener('click', function(e) {
  if (e.target === this) fecharPopupTarefa();
});

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') fecharPopupTarefa();
});

// Inicialização
document.addEventListener('DOMContentLoaded', async function() {
  // Configurar navbar
  const links = document.querySelectorAll('.barra-superior .meio a');
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = link.getAttribute('href');
    });
  });

  const logoImg = document.querySelector('.logo-img');
  if (logoImg) {
    logoImg.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }

  // Carregar dados
  await carregarDadosUsuario();
  await carregarTarefas();
});

// Funções globais
window.abrirPopupTarefa = abrirPopupTarefa;
window.fecharPopupTarefa = fecharPopupTarefa;
window.concluirTarefa = concluirTarefa;
window.carregarTarefas = carregarTarefas;