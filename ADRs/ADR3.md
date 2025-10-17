# Escolha do Stack Tecnológico

###### Metadados do Registro
Data do Registro: 16/10/2025 | Status: Aceito

## Contexto e Declaração de Problema
Foi identificada a necessidade de definir um framework e biblioteca front-end para facilitar o desenvolvimento da equipe e garantir uma base técnica organizada e consistente. Para a escolha, também seria levada em conta a adequação com o tipo de arquitetura definido, o MVC (ADR2).

## Opções Consideradas
* **React**: Biblioteca JavaScript focada em interfaces de usuário.
* **Spring Boot**: Framework escrito em Java e geralmente usado para desenvolvimento backend.
* **Express.js**: Framework minimalista que se encaixa com o Node.js, geralmente usado para desenvolvimento backend.

## Decisão com Justificativa
A decisão foi combinar **React** (para o frontend/View) com o **Express.js** (para o backend/Model/Controller).

Essa escolha foi tomada graças à afinidade e à experiência prévia da equipe com JavaScript e o ecossistema Node.js. A familiaridade dos integrantes implica menos tempo gasto por eles para aprender a manusear as tecnologias, o que se alinha bem com o tempo limitado e ágil do projeto.

| Consequências | Detalhes |
| :--- | :--- |
| **Positivas** | A estrutura simplificada do Express e a modularidade do React deixam a prototipagem inicial mais rápida. Além disso, a comunidade de ambos está bastante ativa, fornecendo mais documentação e suporte para a resolução de eventuais problemas que a equipe encontrar. |
| **Negativas** | Em comparação com o Spring Boot/Java, a escalabilidade e a performance dos escolhidos podem ser mais limitadas. Além disso, o Node.js/Express também não oferece a mesma robustez nem o mesmo nível de recursos de segurança. |
