// Importa a biblioteca Axios para fazer requisições HTTP
import axios from 'axios';

// Cria uma instância customizada do Axios com configurações padrão
const api = axios.create({
  // URL base para todas as requisições
  // Todas as chamadas API serão feitas para http://localhost:5001/api + o endpoint específico
  baseURL: 'http://localhost:5001/api', // URL do backend (servidor local na porta 5000)
  
  // Tempo máximo de espera para uma requisição (em milissegundos)
  // Se a requisição demorar mais de 5 segundos, será cancelada automaticamente
  timeout: 5000, // 5 segundos
});

// Exporta a instância configurada para ser usada em outros arquivos
// Dessa forma, podemos importar este arquivo e usar api.get(), api.post(), etc.
// sem precisar configurar a URL base e timeout toda vez
export default api;