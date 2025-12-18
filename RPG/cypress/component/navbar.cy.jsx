/* eslint-env cypress */
import Navbar from '../../src/components/barra-superior/navbar/Navbar';
import { MemoryRouter } from 'react-router-dom';

describe('Navbar Component', () => {
  beforeEach(() => {
    // Limpa localStorage antes de cada teste
    localStorage.clear();
    cy.viewport(1280, 800);
  });

  it('renderiza os links principais', () => {
    cy.mount(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    cy.contains('Mapa').should('be.visible');
    cy.contains('Minhas Tarefas').should('be.visible');
    cy.contains('Tutorial').should('be.visible');
  });

  it('mostra botão de login quando não há usuário logado', () => {
    cy.mount(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    cy.contains('Entrar').should('be.visible');
  });

  it('mostra nome do usuário quando logado', () => {
    localStorage.setItem('user', JSON.stringify({
      nome: 'Pedro',
      email: 'pedro@teste.com',
      iniciais: 'P'
    }));

    cy.mount(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    cy.contains('Olá, Pedro').should('be.visible');
  });

  it('abre SettingsMenu se usuário for admin', () => {
    // Simula usuário admin
    localStorage.setItem('user', JSON.stringify({
      nome: 'Admin',
      email: 'admin@teste.com',
      iniciais: 'A',
      tipo: 'admin'
    }));

    cy.mount(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    cy.get('#opcoes').click();
    cy.get('.settings-overlay').should('exist');
  });

  it('abre MenuLateral se usuário não for admin', () => {
    localStorage.setItem('user', JSON.stringify({
      nome: 'Pedro',
      email: 'pedro@teste.com',
      iniciais: 'P',
      tipo: 'user'
    }));

    cy.mount(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    cy.get('#opcoes').click();
    cy.get('.settings-overlay').should('exist');
  });
});
