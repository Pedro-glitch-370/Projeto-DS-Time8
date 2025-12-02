# Implementação da Biblioteca Geolib para Cálculos de Distância

###### Metadados do Registro

Data do Registro: 02/12/2025 | Status: Aceito

## Contexto e Declaração de Problema

A plataforma precisa determinar quando um grupo de usuários está suficientemente próximo de um ponto de interesse (pino) para desbloquear uma atividade. Até então, não havia uma solução padronizada para calcular distâncias geográficas entre coordenadas de latitude e longitude, o que dificultava a implementação de regras de proximidade de forma precisa e consistente.

O objetivo é garantir cálculos confiáveis de distância entre usuários e pinos, simplificando a lógica de negócio e aumentando a precisão da funcionalidade de desbloqueio de atividades.

## Opções Consideradas

- **Implementar os cálculos manualmente**: Criar, no próprio código, funções próprias para cálculo de distância.
- **Adotar biblioteca/serviço de terceiros**: Utilizar uma biblioteca consolidada ou um serviço terceirizado que já oferece funções prontas para cálculos de distância entre coordenadas geográficas.

## Decisão com Justificativa

A decisão foi **adotar uma biblioteca especializada**, especificamente a **Geolib**.

Essa escolha foi tomada pela robustez e praticidade da biblioteca, que já implementa cálculos geográficos de forma otimizada e confiável. O uso da Geolib reduz a complexidade do código, evita erros comuns em cálculos manuais e garante maior velocidade de desenvolvimento. Além disso, a biblioteca é amplamente utilizada e possui boa documentação, o que facilita a manutenção e evolução da solução.

| Consequências | Detalhes                                                                                                                                                      |
| :------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Positivas** | Simplificação da lógica de negócio, maior precisão nos cálculos de distância, redução de erros e ganho de produtividade no desenvolvimento. |
| **Negativas** | Introdução de dependência externa na aplicação, exigindo atualização e manutenção da biblioteca conforme novas versões ou mudanças de compatibilidade.       |
