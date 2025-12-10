import { useEffect } from "react";
import { isUserAdmin } from "../para-react/userUtils";
import "./settingsMenu.css";

export default function SettingsMenu({ onClose }) {
  useEffect(() => {
    function handleEsc(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  function handleManageUsers() {
    if (isUserAdmin()) {
      window.location.href = "/src/public/apagar.html";
    } else {
      alert("❌ Apenas administradores podem acessar o gerenciamento de usuários.");
    }
  }

  function handleSystemSettings() {
    if (isUserAdmin()) {
      alert("🔧 Configurações do sistema - Em desenvolvimento");
    } else {
      alert("❌ Apenas administradores podem acessar as configurações do sistema.");
    }
  }

  function handleBackup() {
    if (isUserAdmin()) {
      alert("💾 Backup de dados - Em desenvolvimento");
    } else {
      alert("❌ Apenas administradores podem acessar o backup de dados.");
    }
  }

  return (
    <div className="settings-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="settings-menu">
        <div className="settings-header">
          <h3>⚙️ Configurações</h3>
          <span className="close-settings" onClick={onClose}>&times;</span>
        </div>
        <div className="settings-menu-content">
          <button className="settings-option" onClick={handleManageUsers}>👥 Gerenciar Usuários</button>
          <button className="settings-option" onClick={handleSystemSettings}>🔧 Configurações do Sistema</button>
          <button className="settings-option" onClick={handleBackup}>💾 Backup de Dados</button>
        </div>
      </div>
    </div>
  );
}
