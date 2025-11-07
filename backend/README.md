====================================================
Para iniciar o servidor backend, siga os seguintes passos:

1⁰. Acesse o Diretório do Backend: cd backend
2⁰. Instale as Dependências: npm install. Este comando irá instalar todas as dependências necessárias definidas no arquivo package.json.
3⁰. Execute o Servidor: npm start
4⁰. Acesse as Rotas: Pressione Ctrl + Click em qualquer uma das rotas listadas no terminal para acessá-las através do seu navegador padrão.

====================================================
Rotas Disponíveis: Gerenciamento de Pinos (CRUD)
====================================================
Visualização de Pinso

Rota Principal (/pinos): Retorna todos os pinos cadastrados no formato JSON
Retorna Todos os Pinos
finalidade: feedback visual ou responder os outros compotamentos do CRUD

Funcionalidade:
Retornar todos os pinos cadastrados no formato JSON para fornecer feedback visual
e suportar operações do CRUD.


Rota de adição: (/adicionar)
Adicionar Novo Pino
Finalidade: Criar e salvar um novo pino no sistema

Funcionalidades:

Formulário para inserção de dados.
Validação de coordenadas geográficas.
Persistência no banco de dados.

====================================================
Rota de Atualização: (/atualizar)
Atualizar Pino Existente
Finalidade: Modificar informações de pinos previamente cadastrados

Aplicações:

Correção de dados.
Atualização de localização.
Alteração de mensagens.

====================================================
Rota de deleção
Excluir Pino
Finalidade: Remover permanentemente um pino do sistema

Características:

Interface de listagem completa.
Confirmação de exclusão.
Feedback visual de operação.

====================================================
Visualização no Mapa

⚠️ Pré-requisito Importante
Mantenha o servidor backend em execução. O fechamento do servidor interromperá a comunicação entre o frontend e o backend.

Procedimento de Configuração do Frontend

1. Acesse o Diretório do RPG: cd RPG
2. Instale as Dependências do Frontend: npm install
3. Execute a Aplicação: npm run dev

====================================================
Resultado Esperado

Após a execução dos passos acima, todos os pinos cadastrados no banco de dados serão automaticamente renderizados no mapa interativo.

====================================================
Suporte Técnico

Em caso de dificuldades durante o processo de configuração ou execução, verifique:

Conexão com a internet para download de dependências
Portas de rede disponíveis
Permissões de acesso aos diretórios
Consistência das dependências nos arquivos package.json

====================================================

Status do Sistema: ✅ Operacional
Arquitetura: MVC (Model-View-Controller)
Banco de Dados: MongoDB
Framework Frontend: React