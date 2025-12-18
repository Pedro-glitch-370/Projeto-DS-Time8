/* eslint-env cypress */
import Temporadas from '../../src/components/configurar-temporadas/Temporadas';
import { MemoryRouter } from 'react-router-dom';

describe('Temporadas Component', () => {
  beforeEach(() => {
    // Simula usuário admin no localStorage
    localStorage.setItem('user', JSON.stringify({
      id: 'admin123',
      nome: 'Admin',
      tipo: 'admin'
    }));
  });

  it('renderiza título principal e formulário', () => {
    cy.mount(
      <MemoryRouter>
        <Temporadas />
      </MemoryRouter>
    );

    cy.contains('Configurar Temporadas').should('be.visible');
    cy.get('input[placeholder="Título"]').should('be.visible');
    cy.get('select').should('exist');
    cy.get('button[type="submit"]').should('contain.text', 'Criar Temporada');
  });

  it('permite preencher formulário de nova temporada', () => {
    cy.mount(
      <MemoryRouter>
        <Temporadas />
      </MemoryRouter>
    );

    cy.get('input[placeholder="Título"]').type('Temporada Teste');
    cy.get('select').select('ativo');
    cy.get('input[type="date"]').first().type('2025-12-18');
    cy.get('input[type="date"]').last().type('2025-12-31');

    cy.get('button[type="submit"]').click();
    cy.get('.mensagem').should('exist');
  });

  it('renderiza mensagem de acesso negado para usuário não admin', () => {
    localStorage.setItem('user', JSON.stringify({
      id: 'user123',
      nome: 'Pedro',
      tipo: 'user'
    }));

    cy.mount(
      <MemoryRouter>
        <Temporadas />
      </MemoryRouter>
    );

    cy.contains('Acesso negado. Apenas administradores podem acessar este painel.').should('be.visible');
  });

  it('mostra seção de temporadas existentes', () => {
    cy.mount(
      <MemoryRouter>
        <Temporadas />
      </MemoryRouter>
    );

    cy.contains('Temporada Atual').should('be.visible');
    cy.contains('Temporadas Existentes').should('be.visible');
  });
});
