# Escolha da Tecnologia de Mapa Interativo

###### Metadados do Registro
Data do Registro: 16/10/2025 | Status: Aceito

## Contexto e Declaração de Problema
O componente principal do software é um mapa interativo que vai exibir a localização das tarefas (pinos) a serem feitas pelos usuários. Era importante tomar uma decisão que oferecesse acessibilidade, desempenho e custo-benefício adequados ao projeto.

## Opções Consideradas
* **OpenStreetMap (OSM) + Leaflet**: Solução open source (gratuita) em que o OSM serviria como a fonte dos dados geográficos e o Leaflet como a biblioteca JavaScript que renderizasse o mapa.
* **API do Google Maps + API do Google Places**: Solução comercial que oferece um uma série de recursos, como mapas, geocodificação e dados de locais, com cobertura e precisão altas.

## Decisão com Justificativa
A decisão foi adotar a combinação **OpenStreetMap (OSM)** e **Leaflet**.

Essa escolha foi tomada graças ao fato do OpenStreetMap ser totalmente gratuito, o que elimina os riscos de surgir algum custo imprevisível, o que seria crítico para o grupo. Além disso, a combinação com o Leaflet permite bastante customização da interface e e uma boa performance para visualizar os pinos, que é um dos requisitos principais do software.

| Consequências | Detalhes |
| :--- | :--- |
| **Positivas** | Sem custo de licenciamento e ainda com liberdade pra personalizar o mapa. Além disso, o Leaflet é uma biblioteca leve que permite uma boa velocidade de carregamento. |
| **Negativas** | A precisão do geocoding pode ser inferior a da outra opção, e a base de dados é menos abrangente. |
