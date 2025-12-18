/* eslint-env cypress */
import Tutorial from '../../src/components/tutorial/Tutorial';

describe('Tutorial Component', () => {
  it('renderiza o título principal', () => {
    cy.mount(<Tutorial />);
    cy.contains('Como usar esta plataforma?').should('be.visible');
  });

  it('renderiza seção de desbloquear tarefa', () => {
    cy.mount(<Tutorial />);
    cy.contains('📍 Desbloquear tarefa').should('be.visible');
    cy.contains('50 metros').should('be.visible');
  });

  it('renderiza seção de concluir tarefa', () => {
    cy.mount(<Tutorial />);
    cy.contains('✅ Concluir tarefa').should('be.visible');
    cy.contains('foto').should('be.visible');
    cy.contains('relatório').should('be.visible');
  });

  it('renderiza seção de minhas tarefas', () => {
    cy.mount(<Tutorial />);
    cy.contains('📝 Minhas Tarefas').should('be.visible');
    cy.get('ul li').should('have.length', 3);
    cy.contains('Ver tarefas disponíveis próximas de você').should('be.visible');
    cy.contains('Acompanhar tarefas já concluídas').should('be.visible');
    cy.contains('Sugerir novas tarefas para sua equipe').should('be.visible');
  });

  it('renderiza seção de trabalho em grupo', () => {
    cy.mount(<Tutorial />);
    cy.contains('🤝 Trabalho em grupo').should('be.visible');
    cy.contains('Recife').should('be.visible');
  });
});
