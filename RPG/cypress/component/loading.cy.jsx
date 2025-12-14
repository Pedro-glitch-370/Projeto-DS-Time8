/* eslint-env cypress */
import Loading from '../../src/components/loading/Loading';
import { MemoryRouter } from 'react-router-dom';

describe('Loading Component', () => {
  it('renderiza elementos principais', () => {
    cy.mount(
      <MemoryRouter>
        <Loading />
      </MemoryRouter>
    );

    cy.get('#loading').should('exist');
    cy.get('.logo-loading img').should('have.attr', 'alt', 'Logo Conecta');
    cy.contains('Recife Point Game').should('be.visible');
    cy.contains('Carregando sua aventura por Recife...').should('be.visible');
    cy.get('.progress-bar').should('exist');
  });

  it('cria partículas dinamicamente', () => {
    cy.mount(
      <MemoryRouter>
        <Loading />
      </MemoryRouter>
    );

    // Deve haver 15 partículas criadas
    cy.get('.particle').should('have.length', 15);
  });

  it('remove partículas ao desmontar', () => {
    cy.mount(
      <MemoryRouter>
        <Loading />
      </MemoryRouter>
    ).unmount();

    // Após desmontar, não deve haver partículas
    cy.get('.particle').should('not.exist');
  });
});
