export const SidebarHeader = ({ selectedPino, onClose }) => (
  <div className="header">
    <h3>
      {selectedPino ? "✏️ Editar Ponto" : "📍 Novo Ponto de Interesse"}
    </h3>
    <button onClick={onClose} className="closeButton">
      ×
    </button>
  </div>
);