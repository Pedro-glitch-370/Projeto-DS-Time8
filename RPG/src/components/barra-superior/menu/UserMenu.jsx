import { useEffect } from "react";
import "./userMenu.css";

export default function UserMenu({ usuarioLogado, abaLoginAberta, onClose, onLogout }) {
  // fecha com ESC
  useEffect(() => {
    function handleEsc(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!usuarioLogado || abaLoginAberta) return null;

  return (
    <div className="user-menu" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="user-menu-content">
        <div className="user-info">
          <div className="user-avatar">{usuarioLogado.iniciais}</div>
          <div className="user-details">
            <div className="user-name">{usuarioLogado.nome}</div>
            <div className="user-email">{usuarioLogado.email}</div>
            <div className="user-type">{usuarioLogado.tipo}</div>
          </div>
        </div>
        <div className="user-menu-actions">
          <button className="logout-btn" onClick={onLogout}>
            <span>Sair</span>
          </button>
        </div>
      </div>
    </div>
  );
}