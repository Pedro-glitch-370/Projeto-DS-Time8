import api from './api';

export const temporadaService = {
  // Listar todas as temporadas
  async getTemporadas() {
    try {
      const response = await api.get('/temporadas');
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao carregar temporadas:', error);
      throw error;
    }
  },
  
  // Criar nova temporada
  async criarTemporada(temporadaData) {
    try {
      const response = await api.post('/temporadas', temporadaData);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao criar temporada:', error);
      throw error;
    }
  },
  
  // Atualizar temporada
  async atualizarTemporada(id, dadosAtualizados) {
    try {
      const response = await api.patch(`/temporadas/${id}`, dadosAtualizados);
      return response.data;
    } catch (error) {
      console.error(`❌ Erro ao atualizar temporada ${id}:`, error);
      throw error;
    }
  },
  
  // Deletar temporada
  async deletarTemporada(id) {
    try {
      const response = await api.delete(`/temporadas/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Erro ao deletar temporada ${id}:`, error);
      throw error;
    }
  },
  
  // Validações e formatações (mantenha as funções originais)
  validarTemporada(temporadaData) {
    const erros = [];
    
    if (!temporadaData.titulo?.trim()) {
      erros.push('O título é obrigatório');
    }
    
    if (!temporadaData.dataInicio) {
      erros.push('A data de início é obrigatória');
    }
    
    if (!temporadaData.dataFim) {
      erros.push('A data de fim é obrigatória');
    }
    
    if (temporadaData.dataInicio && temporadaData.dataFim) {
      const inicio = new Date(temporadaData.dataInicio);
      const fim = new Date(temporadaData.dataFim);
      
      if (inicio >= fim) {
        erros.push('A data de início deve ser anterior à data de fim');
      }
    }
    
    return erros;
  },
  
  formatarDadosParaAPI(temporadaData) {
    return {
      titulo: temporadaData.titulo?.trim(),
      dataInicio: temporadaData.dataInicio,
      dataFim: temporadaData.dataFim,
      status: temporadaData.status,
      pinIds: Array.isArray(temporadaData.pinIds) ? temporadaData.pinIds : []
    };
  },
  
  formatarParaExibicao(temporada) {
    return {
      ...temporada,
      dataInicioFormatada: new Date(temporada.dataInicio).toLocaleDateString('pt-BR'),
      dataFimFormatada: new Date(temporada.dataFim).toLocaleDateString('pt-BR'),
      duracao: this.calcularDuracao(temporada.dataInicio, temporada.dataFim)
    };
  },
  
  getStatusFormatado(status) {
    const formatos = {
      agendado: { texto: '⏳ Agendado', cor: '#f39c12' },
      ativo: { texto: '✅ Ativo', cor: '#2ecc71' },
      encerrado: { texto: '❌ Encerrado', cor: '#e74c3c' }
    };
    return formatos[status] || { texto: status, cor: '#95a5a6' };
  },
  
  calcularDuracao(dataInicio, dataFim) {
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    const diff = fim.getTime() - inicio.getTime();
    const dias = Math.ceil(diff / (1000 * 3600 * 24));
    return `${dias} dia${dias !== 1 ? 's' : ''}`;
  }
};