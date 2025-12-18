/* eslint-env cypress */
import GrupoModal from '../../src/components/grupos/GrupoModal';

describe('GrupoModal Component', () => {
  const mockUserSemGrupo = { id: '123', nome: 'Pedro' };
  const mockUserComGrupo = {
    id: '123',
    nome: 'Pedro',
    grupo: {
      nome: 'Grupo Teste',
      codigo: '#ABC123',
      pontuacaoTotal: 50,
      membros: [
        { _id: '1', nome: 'Alice', capibas: 10 },
        { _id: '2', nome: 'Bob', capibas: 20 }
      ],
      lider: '1'
    }
  };

  it('não renderiza quando isOpen = false', () => {
    cy.mount(
      <GrupoModal
        isOpen={false}
        onClose={() => {}}
        user={mockUserSemGrupo}
        atualizarUsuario={() => {}}
      />
    );
    cy.get('.grupo-modal-overlay').should('not.exist');
  });

  it('renderiza formulário quando usuário não tem grupo', () => {
    cy.mount(
      <GrupoModal
        isOpen={true}
        onClose={() => {}}
        user={mockUserSemGrupo}
        atualizarUsuario={() => {}}
      />
    );

    cy.contains('Junte-se a um Grupo').should('be.visible');
    cy.contains('Entrar').should('be.visible');
    cy.contains('Criar Novo').should('be.visible');
    cy.get('form').should('exist');
  });

  it('permite alternar entre abas Entrar e Criar', () => {
    cy.mount(
      <GrupoModal
        isOpen={true}
        onClose={() => {}}
        user={mockUserSemGrupo}
        atualizarUsuario={() => {}}
      />
    );

    cy.contains('Criar Novo').click();
    cy.get('input[placeholder="Nome do Grupo"]').should('be.visible');
    cy.get('textarea[placeholder="Descrição do grupo..."]').should('be.visible');

    cy.contains('Entrar').click();
    cy.get('input[placeholder="#Código do Grupo (ex: #A3F9)"]').should('be.visible');
  });

  it('renderiza informações do grupo quando usuário já tem grupo', () => {
    cy.mount(
        <GrupoModal
            isOpen={true}
            onClose={() => {}}
            user={mockUserComGrupo}
            atualizarUsuario={() => {}}
        />
    );
    
    cy.contains('Meu Grupo').should('be.visible');
    cy.contains('Grupo Teste').should('be.visible');
    cy.contains('🏆 Pontos Totais: ').should('be.visible');
    cy.contains('50').should('be.visible');
    cy.contains('Código de Convite:').should('be.visible');
    cy.get('.pagination-dots .dot').eq(1).click();
    cy.get('.membro-nome').should('contain.text', 'Alice');
    cy.get('.membro-nome').should('contain.text', '👑');
  });

  it('permite alternar entre páginas de Info e Membros', () => {
    cy.mount(
      <GrupoModal
        isOpen={true}
        onClose={() => {}}
        user={mockUserComGrupo}
        atualizarUsuario={() => {}}
      />
    );

    // Página inicial (Info)
    cy.contains('🏆 Pontos Totais: 50').should('be.visible');

    // Clica no dot para ir para Membros
    cy.get('.pagination-dots .dot').eq(1).click();
    cy.contains('👥 Membros (2/5)').should('be.visible');
    cy.get('.membro-nome').should('contain.text', 'Alice');
    cy.get('.membro-nome').should('contain.text', '👑');
  });
});
