const cron = require('node-cron');
const Grupo = require('../models/grupoModel');
const Cliente = require('../models/clienteModel');

// Agenda a tarefa para rodar todos os dias à meia-noite (00:00)
cron.schedule('0 0 * * *', async () => {
    console.log('⏰ Rodando verificação diária de pagamentos de Grupos...');

    try {
        const hoje = new Date();

        // 1. Busca grupos cuja data de pagamento é hoje ou já passou
        const gruposParaPagar = await Grupo.find({ 
            dataProximoPagamento: { $lte: hoje } 
        });

        if (gruposParaPagar.length === 0) {
            console.log('✅ Nenhum grupo para pagar hoje.');
            return;
        }

        console.log(`💰 Processando pagamento para ${gruposParaPagar.length} grupos.`);

        // 2. Loop por cada grupo
        for (const grupo of gruposParaPagar) {
            
            // Lógica: Divide pontuação por 3
            const recompensaPorMembro = Math.floor(grupo.pontuacaoTotal / 3);

            if (recompensaPorMembro > 0) {
                // 3. Distribui para TODOS os membros do grupo
                await Cliente.updateMany(
                    { _id: { $in: grupo.membros } }, // Filtra os IDs dos membros
                    { $inc: { capibas: recompensaPorMembro } } // Adiciona na carteira
                );

                console.log(` -> Grupo "${grupo.nome}": Distribuiu ${recompensaPorMembro} capibas para ${grupo.membros.length} membros.`);
            }

            // 4. PREPARA PARA O PRÓXIMO MÊS
            // Zera a pontuação do grupo (Nova Temporada)
            grupo.pontuacaoTotal = 0;
            
            // Define o próximo pagamento para daqui a 30 dias
            const novaData = new Date();
            novaData.setDate(novaData.getDate() + 30);
            grupo.dataProximoPagamento = novaData;

            await grupo.save();
        }

        console.log('✅ Distribuição mensal concluída com sucesso!');

    } catch (error) {
        console.error('❌ Erro no Cron Job de Grupos:', error);
    }
});

module.exports = cron;