export const ActionButtons = ({ mode, onSave, onUpdate, onDelete, onCancel, hasChanges }) => {
  const renderCreationMode = () => (
    <button onClick={onSave} className="saveButton">
      ✅ Salvar Novo Ponto
    </button>
  );

  const renderEditionMode = () => (
    <>
      <button onClick={onUpdate} className="updateButton" disabled={!hasChanges} type="button">
        🔄 Atualizar Ponto
      </button>
      <button onClick={onDelete} className="deleteButton" type="button">
        🗑️ Excluir Ponto
      </button>
    </>
  );

  return (
    <div className="buttonGroup">
      {mode === 'creation' && renderCreationMode()}
      {mode === 'edition' && renderEditionMode()}
      <button onClick={onCancel} className="cancelButton">
        ↩️ Cancelar
      </button>
    </div>
  );
};