/* eslint-env cypress */
import Loading from '../../src/components/loading/Loading';

describe('Loading Component', () => {
  it('renderiza elementos principais da tela de loading', () => {
    cy.mount(<Loading />);

    // Verifica se o container principal existe
    cy.get('#loading').should('be.visible');

    // Verifica se o logo aparece
    cy.get('.logo-loading img')
      .should('be.visible')
      .and('have.attr', 'alt', 'Logo Conecta');

    // Verifica se o spinner aparece
    cy.get('.loading-spinner').should('be.visible');

    // Verifica se o texto principal aparece
    cy.contains('Recife Point Game').should('be.visible');

    // Verifica se o subtítulo aparece
    cy.contains('Carregando sua aventura por Recife...').should('be.visible');

    // Verifica se a barra de progresso existe
    cy.get('.progress-bar').should('exist');
    cy.get('.progress').should('exist');
  });

  it('gera partículas dentro do container', () => {
    cy.mount(<Loading />);

    // Deve haver várias divs com classe "particle"
    cy.get('#particles .particle').should('have.length.greaterThan', 0);
  });
});
