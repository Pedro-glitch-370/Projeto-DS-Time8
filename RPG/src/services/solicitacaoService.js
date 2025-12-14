import api from './api';

export const solicitacaoService = {
    // Buscar todas as solicitações
    async getSolicitacoes() {
        try {
            const userData = localStorage.getItem('user');
            if (!userData) throw new Error('Usuário não logado');
            
            const user = JSON.parse(userData);
            
            // DEBUG: Log dos dados do usuário
            console.log('🔍 Service - Dados do usuário:', {
                id: user.id,
                _id: user._id,
                nome: user.nome,
                tipo: user.tipo
            });
            
            const config = {
                headers: {
                    'user-id': user.id || user._id,
                    'user-type': user.tipo || user.role,
                    'user-name': user.nome || user.name || user.username
                }
            };
            
            console.log('📤 Service - Headers sendo enviados:', config.headers);
            const response = await api.get('/solicitacoes', config);
            
            console.log('📥 Service - Resposta do backend:', {
                quantidade: response.data.length,
                primeiraSolicitacao: response.data[0]
            });
            
            return response.data;
        } catch (error) {
            console.error('❌ Erro ao buscar solicitações:', error);
            throw error;
        }
    },

    // Criar nova solicitação
    async criarSolicitacao(nome, msg, capibas) {
        try {
            const userData = localStorage.getItem('user');
            if (!userData) throw new Error('Usuário não logado');
            
            const user = JSON.parse(userData);
            
            const config = {
                headers: {
                    'user-id': user.id || user._id,
                    'user-type': user.tipo || user.role,
                    'user-name': user.nome || user.name || user.username
                }
            };
            
            const response = await api.post('/solicitacoes/adicionar', {
                nome,
                msg,
                capibas: parseInt(capibas) || 0
            }, config);
            
            return response.data;
        } catch (error) {
            console.error('❌ Erro ao criar solicitação:', error);
            throw error;
        }
    },

    // Atualizar solicitação
    async atualizarSolicitacao(id, nome, msg, capibas) {
        try {
            const userData = localStorage.getItem('user');
            if (!userData) throw new Error('Usuário não logado');
            
            const user = JSON.parse(userData);
            
            const config = {
                headers: {
                    'user-id': user.id || user._id,
                    'user-type': user.tipo || user.role,
                    'user-name': user.nome || user.name || user.username
                }
            };
            
            const response = await api.put(`/solicitacoes/atualizar/${id}`, {
                nome,
                msg,
                capibas: parseInt(capibas) || 0
            }, config);
            
            return response.data;
        } catch (error) {
            console.error('❌ Erro ao atualizar solicitação:', error);
            throw error;
        }
    },

    // Aprovar solicitação
    async aprovarSolicitacao(id) {
        try {
            const userData = localStorage.getItem('user');
            if (!userData) throw new Error('Usuário não logado');
            
            const user = JSON.parse(userData);
            
            const config = {
                headers: {
                    'user-id': user.id || user._id,
                    'user-type': user.tipo || user.role,
                    'user-name': user.nome || user.name || user.username
                }
            };
            
            const response = await api.patch(`/solicitacoes/aprovar/${id}`, {}, config);
            return response.data;
        } catch (error) {
            console.error('❌ Erro ao aprovar solicitação:', error);
            throw error;
        }
    },

    // Rejeitar solicitação
    async rejeitarSolicitacao(id, motivo = '') {
        try {
            const userData = localStorage.getItem('user');
            if (!userData) throw new Error('Usuário não logado');
            
            const user = JSON.parse(userData);
            
            const config = {
                headers: {
                    'user-id': user.id || user._id,
                    'user-type': user.tipo || user.role,
                    'user-name': user.nome || user.name || user.username
                }
            };
            
            const response = await api.patch(`/solicitacoes/rejeitar/${id}`, { motivo }, config);
            return response.data;
        } catch (error) {
            console.error('❌ Erro ao rejeitar solicitação:', error);
            throw error;
        }
    },

    // Deletar solicitação
    async deletarSolicitacao(id) {
        try {
            const userData = localStorage.getItem('user');
            if (!userData) throw new Error('Usuário não logado');
            
            const user = JSON.parse(userData);
            
            const config = {
                headers: {
                    'user-id': user.id || user._id,
                    'user-type': user.tipo || user.role,
                    'user-name': user.nome || user.name || user.username
                }
            };
            
            const response = await api.delete(`/solicitacoes/deletar/${id}`, config);
            return response.data;
        } catch (error) {
            console.error('❌ Erro ao deletar solicitação:', error);
            throw error;
        }
    }
};