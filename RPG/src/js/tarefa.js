// Importar os serviços
import { pinoService } from '../services/pinoService.js'
import { clienteService } from '../services/clienteService.js';
import { adminService } from '../services/adminService.js';

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
// Função para carregar dados do usuário - ATUALIZADA
async function carregarDadosUsuario() {
  try {
    usuarioLogado = verificarLogin();
    if (!usuarioLogado) return;

    console.log('🔄 Carregando dados do usuário...');
    
    // INICIALIZAR DADOS BÁSICOS
    usuarioLogado.tarefasCompletas = usuarioLogado.tarefasCompletas || 0;
    usuarioLogado.capibas = usuarioLogado.capibas || 0;
    usuarioLogado.tarefasConcluidas = usuarioLogado.tarefasConcluidas || [];
    tarefasConcluidas = usuarioLogado.tarefasConcluidas;
    
    if (usuarioLogado.tipo === 'admin') {
      // Usar adminService para admin
      try {
        const admin = await adminService.getAdmin(usuarioLogado.id);
        // Atualizar dados do admin
        usuarioLogado.tarefasCompletas = admin.tarefasCompletas || usuarioLogado.tarefasCompletas;
        usuarioLogado.tarefasConcluidas = admin.tarefasConcluidas || usuarioLogado.tarefasConcluidas;
      } catch (error) {
        console.log('❌ Erro ao buscar admin por ID, tentando por email...', error.message);
        try {
          const admin = await adminService.getAdminByEmail(usuarioLogado.email);
          usuarioLogado.tarefasCompletas = admin.tarefasCompletas || usuarioLogado.tarefasCompletas;
          usuarioLogado.tarefasConcluidas = admin.tarefasConcluidas || usuarioLogado.tarefasConcluidas;
        } catch (emailError) {
          console.warn('⚠️ Ambas as tentativas falharam, usando dados locais do admin:', emailError.message);
          // Manter dados locais
        }
      }
    } else {
      // Usar clienteService para cliente
      try {
        let cliente;
        try {
          cliente = await clienteService.getCliente(usuarioLogado.id);
        } catch (error) {
          console.log('❌ Erro ao buscar cliente por ID, tentando por email...', error.message);
          cliente = await clienteService.getClienteByEmail(usuarioLogado.email);
        }
        
        // ATUALIZAR DADOS DO CLIENTE COM DADOS DO BACKEND
        usuarioLogado.capibas = cliente.capibas || usuarioLogado.capibas;
        usuarioLogado.tarefasCompletas = cliente.tarefasCompletas || usuarioLogado.tarefasCompletas;
        usuarioLogado.tarefasConcluidas = cliente.tarefasConcluidas || usuarioLogado.tarefasConcluidas;

      } catch (error) {
        console.warn('⚠️ Ambas as tentativas falharam, usando dados locais do cliente:', error.message);
        // Manter dados locais
      }
    }

    // ATUALIZAR VARIÁVEL GLOBAL
    tarefasConcluidas = usuarioLogado.tarefasConcluidas;

    // Salvar dados atualizados no localStorage
    localStorage.setItem('user', JSON.stringify(usuarioLogado));

    console.log('✅ Dados do usuário carregados:', {
      tipo: usuarioLogado.tipo,
      capibas: usuarioLogado.capibas,
      tarefasCompletas: usuarioLogado.tarefasCompletas,
      tarefasConcluidas: tarefasConcluidas.length
    });

    // Atualizar interface
    document.getElementById('userTarefasCompletas').textContent = usuarioLogado.tarefasCompletas;
    
    // Apenas clientes mostram capibas
    if (usuarioLogado.tipo !== 'admin') {
      document.getElementById('userCapibas').textContent = usuarioLogado.capibas;
    } else {
      // Para admin, pode mostrar 0 ou esconder
      document.getElementById('userCapibas').textContent = '0';
    }
    
  } catch (error) {
    console.error('❌ Erro ao carregar dados do usuário:', error);
    // Fallback mínimo em caso de erro crítico
    usuarioLogado = usuarioLogado || {};
    usuarioLogado.tarefasCompletas = usuarioLogado.tarefasCompletas || 0;
    usuarioLogado.capibas = usuarioLogado.capibas || 0;
    tarefasConcluidas = usuarioLogado.tarefasConcluidas || [];
    
    // Tentar atualizar interface mesmo com erro
    try {
      document.getElementById('userTarefasCompletas').textContent = usuarioLogado.tarefasCompletas;
      if (usuarioLogado.tipo !== 'admin') {
        document.getElementById('userCapibas').textContent = usuarioLogado.capibas;
      } else {
        document.getElementById('userCapibas').textContent = '0';
      }
    } catch (uiError) {
      console.error('❌ Erro ao atualizar interface:', uiError);
    }
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
// tarefa.js - FUNÇÃO CONCLUIR TAREFA CORRIGIDA
async function concluirTarefa() {
  if (!tarefaAtual || !botaoAtual || !usuarioLogado) return;
  
  try {
    let resultado;
    
    // VERIFICAR SE É ADMIN OU CLIENTE
    if (usuarioLogado.tipo === 'admin') {
      console.log('👨‍💼 Admin testando tarefa (sem capibas)');
      
      try {
        // Admin usa adminService (não ganha capibas)
        resultado = await adminService.concluirTarefa(
          usuarioLogado.id, 
          tarefaAtual.id
        );
        
        // Atualizar apenas tarefas completas
        usuarioLogado.tarefasCompletas = resultado.tarefasCompletas || (usuarioLogado.tarefasCompletas + 1);
        
      } catch (error) {
        console.warn('⚠️ AdminService falhou, usando fallback local:', error.message);
        // Fallback local para admin
        usuarioLogado.tarefasCompletas = (usuarioLogado.tarefasCompletas || 0) + 1;
      }
      
    } else {
      console.log('👤 Cliente concluindo tarefa (ganha capibas)');
      
      try {
        // Cliente usa clienteService (ganha capibas)
        resultado = await clienteService.concluirTarefa(
          usuarioLogado.id, 
          tarefaAtual.id, 
          tarefaAtual.capibas
        );
        
        // Atualizar dados do cliente COM OS DADOS DO BACKEND
        usuarioLogado.capibas = resultado.capibas;
        usuarioLogado.tarefasCompletas = resultado.tarefasCompletas;
        usuarioLogado.tarefasConcluidas = resultado.tarefasConcluidas || [];
        
      } catch (error) {
        console.warn('⚠️ ClienteService falhou, usando fallback local:', error.message);
        // Fallback para cliente
        usuarioLogado.capibas = (usuarioLogado.capibas || 0) + tarefaAtual.capibas;
        usuarioLogado.tarefasCompletas = (usuarioLogado.tarefasCompletas || 0) + 1;
        
        if (!usuarioLogado.tarefasConcluidas) {
          usuarioLogado.tarefasConcluidas = [];
        }
        usuarioLogado.tarefasConcluidas.push(tarefaAtual.id);
      }
    }

    // ATUALIZAR VARIÁVEL GLOBAL DE TAREFAS CONCLUÍDAS
    tarefasConcluidas = usuarioLogado.tarefasConcluidas || [];

    // Salvar dados atualizados no localStorage
    localStorage.setItem('user', JSON.stringify(usuarioLogado));

    // ATUALIZAR INTERFACE E ESTADO DA TAREFA
    atualizarTarefaConcluida();

  } catch (error) {
    console.error('❌ Erro ao concluir tarefa:', error);
    mostrarErroConclusao();
  }
}

// Função para atualizar a tarefa concluída na interface
function atualizarTarefaConcluida() {
  try {
    const tarefaItem = botaoAtual.closest('.tarefa-item');
    const status = tarefaItem.querySelector('.status');
    
    // Atualizar estado visual
    status.textContent = '✅ Concluída';
    status.className = 'status status-concluida';
    botaoAtual.textContent = 'Tarefa Concluída';
    botaoAtual.disabled = true;
    tarefaItem.classList.add('tarefa-concluida');

    // Atualizar estatísticas na interface
    document.getElementById('userTarefasCompletas').textContent = usuarioLogado.tarefasCompletas;
    
    // Apenas clientes veem capibas atualizados
    if (usuarioLogado.tipo !== 'admin') {
      document.getElementById('userCapibas').textContent = usuarioLogado.capibas;
    }

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

    // Mostrar mensagem de sucesso
    mostrarMensagemSucesso();

    // Fechar popup
    fecharPopupTarefa();
  } catch (error) {
    console.error('❌ Erro ao atualizar tarefa concluída:', error);
    fecharPopupTarefa();
    mostrarMensagemSucesso();
  }
}

// Função para mostrar mensagem de sucesso
function mostrarMensagemSucesso() {
  try {
    if (usuarioLogado.tipo === 'admin') {
      alert(`✅ Tarefa testada com sucesso!\n\n📊 Tarefas testadas: ${usuarioLogado.tarefasCompletas}`);
    } else {
      alert(`🎉 Parabéns! Você ganhou ${tarefaAtual.capibas} capibas!\n\n💰 Total: ${usuarioLogado.capibas} capibas\n✅ Tarefas completas: ${usuarioLogado.tarefasCompletas}`);
    }
  } catch (error) {
    console.error('❌ Erro ao mostrar mensagem de sucesso:', error);
  }
}

// Função para mostrar erro na conclusão
function mostrarErroConclusao() {
  try {
    if (usuarioLogado.tipo === 'admin') {
      alert('❌ Erro ao testar tarefa. Tente novamente.');
    } else {
      alert('❌ Erro ao concluir tarefa. Tente novamente.');
    }
  } catch (error) {
    console.error('❌ Erro ao mostrar mensagem de erro:', error);
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