import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isUserAdmin } from "../para-react/userUtils";
import { authService } from "../../../services/authService";
import "./settingsMenu.css";

export default function SettingsMenu({ onClose, isOpen }) {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  useEffect(() => {
    function handleEsc(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  function handleManageUsers() {
    if (isUserAdmin()) {
      navigate("/gerenciar");
    } else {
      alert("❌ Apenas administradores podem acessar o gerenciamento de usuários.");
    }
  }

  function handleSeasonConfiguration() {
    if (isUserAdmin()) {
      navigate("/temporadas")
    } else {
      alert("❌ Apenas administradores podem acessar as configurações do sistema.");
    }
  }

  function handleLogout() {
    authService.logout(); 
    navigate("/");
  }

  function handleClose() {
    setVisible(false);
    const timeout = setTimeout(() => {
      onClose();
    }, 300);
    return () => clearTimeout(timeout);
  }

  if (!isOpen) return null;
  
  return (
    <div className="settings-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`settings-menu ${visible ? "open" : ""}`}>
        
        <div className="settings-header">
          <h3>⚙️ Configurações</h3>
          <span className="close-settings" onClick={handleClose}>&times;</span>
        </div>

        <div className="settings-menu-content">
          <button className="settings-option" onClick={handleManageUsers}>👥 Gerenciar Usuários</button>
          <button className="settings-option" onClick={handleSeasonConfiguration}>🔧 Configurar Temporadas</button>
          <button className="settings-option" onClick={handleLogout}>↩ Sair da Conta</button>
        </div>
        <div className="copyright">
          Recife Point Game &copy; 2025
        </div>
      </div>
    </div>
  );
}
