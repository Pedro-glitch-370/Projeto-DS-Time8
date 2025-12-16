# Escolha do Gerenciamento de Banco de Dados

###### Metadados do Registro
Data do Registro: 16/10/2025 | Status: Aceito

## Contexto e Declaração de Problema
Foi identificada a necessidade de definir o sistema de gerenciamento de banco de dados para organizar melhor os dados do projeto e facilitar a consulta deles. Para a escolha, também seriam levadas em conta a integridade das informações e a adequação ao tipo de arquitetura definido, o MVC (ADR2).

## Opções Consideradas
* **Tecnologia SQL (Relacional)**: Modelos baseados em tabelas, mais rígidos e focados na integridade e nas relações.
* **Tecnologia NoSQL (de preferência, MongoDB)**: Modelos baseados em documentos, mais flexíveis e focados na escalabilidade e na velocidade de escrita.

## Decisão com Justificativa
A decisão foi adotar a **Tecnologia SQL (Relacional)**.

Essa escolha foi tomada graças ao tipo dos dados do projeto, que são, em sua maioria, estruturados e exigem mais consistência. O modelo relacional do SQL se encaixa melhor nessa demanda pois mantém a validade e a confiança dos dados.

| Consequências | Detalhes |
| :--- | :--- |
| **Positivas** | Mais performance, robustez e integridade de dados, além de permitir consultas estruturadas, o que é interessante para o projeto. |
| **Negativas** | O esquema de dados é rígido, o que pode dificultar o desenvolvimento caso, futuramente, seja preciso evoluir ou alterar a sua estrutura. |
