# Escolha da Arquitetura do Sistema

###### Metadados do Registro
Data do Registro: 16/10/2025 | Status: Aceito

## Contexto e Declaração de Problema
Foi identificada a necessidade de definir a estrutura de arquitura do software para ajudar na organização do código, nas diretrizes de design e na consistência entre os membros da equipe. Uma arquitetura que não fosse realmente apropriada com o projeto poderia dificultar a colaboração entre os membros, a implementação de novos recursos e a manutenção do código.

## Opções Consideradas
* **Model-View-Controller (MVC)**: Modelo recorrente que separa a aplicação em três componentes - Modelo, Visão e Controlador.
* **Arquitetura de Microsserviços**: Modelo que estrutura a aplicação em pequenos serviços independentes.

## Decisão com Justificativa
A decisão foi adotar o **Padrão Model-View-Controller (MVC)**.

Esse modelo foi considerado o mais adequado por causa da familidade e do conhecimento da equipe com ele, o que facilitaria a divisão de tarefas (Model para backend, View para frontend e Controller como intermediário entre os dois). Além disso, a arquitetura de microsserviços também foi rejeitada pela sua complexidade, sendo desproporcional ao escopo pensado do projeto.

| Consequências | Detalhes |
| :--- | :--- |
| **Positivas** | A familiaridade da equipe com o MVC facilita a leitura do código, a correção de problemas e a colaboração entre os membros do grupo. |
| **Negativas** | O uso do MVC dificulta a escalabilidade do software caso o projeto venha a crescer e exigir mais demanda de processamento. |
