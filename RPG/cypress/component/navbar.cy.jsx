/* eslint-env cypress */
import Navbar from '../../src/components/barra-superior/navbar/Navbar';
import { MemoryRouter } from 'react-router-dom';

describe('Navbar Component', () => {
  it('renderiza os links principais', () => {
    // Monta a Navbar dentro de um Router
    cy.mount(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    // Verifica se os links aparecem
    cy.contains('Mapa').should('be.visible');
    cy.contains('Minhas Tarefas').should('be.visible');
    cy.contains('Capibas').should('be.visible');
  });

  it('mostra botão de login quando não há usuário logado', () => {
    // Garante que não há usuário no localStorage
    localStorage.removeItem('user');

    cy.mount(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    cy.contains('Entrar').should('be.visible');
  });

  it('mostra nome do usuário quando logado', () => {
    // Simula usuário no localStorage
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
});
