# Substituição do Gerenciamento de Banco de Dados

###### Metadados do Registro

Data do Registro: 10/11/2025 | Status: Aceito

## Contexto e Declaração de Problema

Após a decisão inicial (ADR 4) de adotar um banco de dados SQL relacional para garantir a integridade dos dados, foi reavaliada a necessidade do projeto em relação à flexibilidade e à forma de armazenamento dos dados. O objetivo é otimizar a comunicação entre a aplicação e o banco de dados e simplificar a gestão de informações.

## Opções Consideradas

- **Manter a Tecnologia SQL (Relacional)**: Modelos baseados em tabelas e estruturas rígidas.
- **Adotar a Tecnologia NoSQL (MongoDB)**: Modelo baseado em documentos JSON, muito mais flexível.

## Decisão com Justificativa

A decisão foi **adotar a tecnologia NoSQL**, utilizando o **MongoDB**.

Esta escolha foi tomada pela afinidade percebida entre o banco de dados e a arquitetura da aplicação, visto que o MongoDB armazena dados em um formato semelhante ao JSON. Essa característica facilita a manipulação e a transferência de dados, pois o formato de documento se alinha com as estruturas de objetos utilizadas na aplicação. Além disso, o MongoDB é conhecido por ser mais simples e ágil para se trabalhar no desenvolvimento.

| Consequências | Detalhes                                                                                                                                                      |
| :------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Positivas** | Alta sinergia com a aplicação devido ao formato de armazenamento JSON, facilitando a leitura e a escrita. Além disso, oferece mais flexibilidade e agilidade. |
| **Negativas** | Pode haver, à princípio, um desafio em garantir a integridade e a consistência complexa dos dados, o que é algo típico dos bancos de dados relacionais.       |
