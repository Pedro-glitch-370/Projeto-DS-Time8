# 📘 Recife Point Game - Documentação Técnica
Esse projeto foi desenvolvido em grupo para a cadeira de Desenvolvimento de Software da Universidade Federal de Pernambuco.

## 👥 Integrantes do Grupo
- [Adna Lisia Farias da Silva](https://github.com/adnalisia)
- [Anderson Cabral Silva Junior](https://github.com/andersoncabrall)
- [Bruno Souza Lopes Melo](https://github.com/brunoslm)
- [Ezequiel França de Santana](https://github.com/ezequielefs034)
- [Pedro Henrique Brito Machado](https://github.com/Pedro-glitch-370)
- [Valci Marques de Melo](https://github.com/Valci2)
- [Vinícius Cavalcanti de Freitas](https://github.com/Vinicius2703)

---

## ⚙️ Funcionamento Técnico
- Backend rodado em Node.js por meio de Express.js
- Frontend renderizado com React + Vite
- Model-View-Controller como padrão de arquitetura usado
- MongoDB como banco de dados utilizado
- Uso da biblioteca [Leaftlet](https://react-leaflet.js.org) para renderização de mapa
- Uso da biblioteca [Geolib](https://deltares.github.io/GEOLib/latest/index.html) para obtenção de localização

---

## 🏗️ Decisões Arquiteturais
Todas as decisões arquiteturais podem ser visualizadas na pasta **ADR** do repositório.  
Em resumo, o grupo realizou **sete decisões principais**:

1. [Escolha do Modelo de Registro](https://github.com/Pedro-glitch-370/Projeto-DS-Time8/blob/main/ADRs/ADR1.md)  
2. [Escolha da Arquitetura do Sistema](https://github.com/Pedro-glitch-370/Projeto-DS-Time8/blob/main/ADRs/ADR2.md)
3. [Escolha do Stack Tecnológico](https://github.com/Pedro-glitch-370/Projeto-DS-Time8/blob/main/ADRs/ADR3.md)
4. [Escolha do Gerenciamento do Banco de Dados](https://github.com/Pedro-glitch-370/Projeto-DS-Time8/blob/main/ADRs/ADR4.md)  
5. [Escolha da Tecnologia de Mapa Interativo](https://github.com/Pedro-glitch-370/Projeto-DS-Time8/blob/main/ADRs/ADR5.md)  
6. [Substituição do Gerenciamento do Banco de Dados](https://github.com/Pedro-glitch-370/Projeto-DS-Time8/blob/main/ADRs/ADR6.md) 
7. [Implementação da Biblioteca **Geolib** para cálculos de distância](https://github.com/Pedro-glitch-370/Projeto-DS-Time8/blob/main/ADRs/ADR7.md)  

---

## 🧪 Testes Automatizados
Para os testes automatizados, foi utilizada a framework **Jest**, que permitiu criar testes claros e confiáveis de regras de negócio com a ajuda de um banco de dados falso.

**Exemplos de testes:**
- [validarLocalizacaoController.test.js](https://github.com/Pedro-glitch-370/Projeto-DS-Time8/blob/main/backend/tests/controllers/validarLocalizacaoController.test.js)  
- [adminController.test.js](https://github.com/Pedro-glitch-370/Projeto-DS-Time8/blob/main/backend/tests/controllers/adminController.test.js)

---

## 🎨 Testes de UI
Para os testes de interface, foi utilizada a framework **Cypress**, que possibilita validar componentes e fluxos da aplicação web diretamente no navegador.

**Exemplos de testes:**
- [loading.cy.jsx](https://github.com/Pedro-glitch-370/Projeto-DS-Time8/blob/main/RPG/cypress/component/loading.cy.jsx)
- [navbar.cy.jsx](https://github.com/Pedro-glitch-370/Projeto-DS-Time8/blob/main/RPG/cypress/component/navbar.cy.jsx)

---

## Evidências de Refactoring
- No [Commit 186370d](https://github.com/Pedro-glitch-370/Projeto-DS-Time8/blob/186370d79c1e5887ee25273ea8f24ea8dd18b08f/RPG/src/components/mapa/Mapa.jsx), nota-se um God Component (componente com sobrecarga de funções) em Mapa.jsx. Posteriormente, no [Commit 2f61985](https://github.com/Pedro-glitch-370/Projeto-DS-Time8/tree/2f619858b66d113ae2359883312401f320e818fb/RPG/src/components/mapa), foram aplicados extração de métodos e modularização para esse problema.
- No [Commit 19183bd](https://github.com/Pedro-glitch-370/Projeto-DS-Time8/blob/19183bd550c44ebae3c6eb573076829ce29846c8/RPG/src/components/barra-lateral/barra-lateral.jsx), nota-se outro God Component em barra-lateral.jsx. Posteriormente, no [Commit 3c5d912](https://github.com/Pedro-glitch-370/Projeto-DS-Time8/tree/3c5d9125976cc6feefe0c5f58ae9d6473c546b00/RPG/src/components/barra-lateral/componentes-auxiliares), foram aplicados extração de métodos e modularização para esse problema.
- No [Commit e571e63](https://github.com/Pedro-glitch-370/Projeto-DS-Time8/tree/2136224ad8e070563b24ec7ae841114a9760bb5d/RPG/src), nota-se a utilização de Javascript e HTML puros, o que ia contra às definições iniciais do projeto. Posteriormente, no [Commit 33f4cdf](https://github.com/Pedro-glitch-370/Projeto-DS-Time8/commit/33f4cdf15ecd172e6df1d7a0d5183e9059a45b98), vê-se o final do processo de transformação destes em componentes .jsx, mais apropriados para React.
- No [Commit 6c288b6](https://github.com/Pedro-glitch-370/Projeto-DS-Time8/blob/2136224ad8e070563b24ec7ae841114a9760bb5d/RPG/src/components/barra-superior/barra-superior-loader.js), da mesma forma, havia um loader em Javascript puro para carregar a Navbar. Posteriormente, no [Commit 33f4cdf](https://github.com/Pedro-glitch-370/Projeto-DS-Time8/blob/33f4cdf15ecd172e6df1d7a0d5183e9059a45b98/RPG/src/components/barra-superior/Navbar.jsx), vê-se o final do processo de transformação desta em Navbar.jsx, contribuindo inclusive para melhor renderização do componente.

## Dockerização
O grupo realizou dockerização da aplicação.
