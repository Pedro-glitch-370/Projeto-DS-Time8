import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAtualizarUsuarioLogado } from "../barra-superior/utils/userState";
import "../../css/gerenciarUsers.css";

const GerenciarUsers = () => {
  const [currentUser, setCurrentUser] = useState("Carregando...");
  const [totalAdmins, setTotalAdmins] = useState(0);
  const [totalClientes, setTotalClientes] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeTab, setActiveTab] = useState("admins");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();

  // Simulação de carregamento inicial ADAPTAR ISSO AQUI
  useEffect(() => {
    // Aqui você chamaria sua API para buscar usuários  ADAPTAR ISSO AQUI
    setCurrentUser("Administrador Pedro");
    setTotalAdmins(3);
    setTotalClientes(12);
    setTotalUsers(15);
  }, []);

  const logout = () => {
    localStorage.removeItem("user");
    const atualizar = getAtualizarUsuarioLogado();
    atualizar(null);
    alert("Logout realizado!");
    navigate("/");
  };

  const openTab = (tab) => {
    setActiveTab(tab);
  };

  const closeModal = () => {
    // lógica para fechar modal ADAPTAR ISSO AQUI
    alert("Cancelado");
  };

  const confirmDelete = () => {
    // lógica para excluir usuário ADAPTAR ISSO AQUI
    alert("Usuário excluído!");
  };  

  return (
    <div className="admin-container">
      {/* Header */}
      <div className="header-gerenciar">
        <h1>Gerenciar Usuários</h1>
        <div className="user-info-gerenciar">
          <p className="user-welcome-gerenciar">Administrador atual: {currentUser}</p>
        </div>
      </div>

      {/* Content */}
      <div className="content">
        <div className="nav-links">
          <a className="back-link-gerenciar" href="/">Voltar ao Mapa</a>
          <button className="logout-btn-gerenciar" onClick={logout}>Sair</button>
        </div>

        {/* Stats */}
        <div className="stats">
          <div className="stat-card">
            <div className="stat-number">{totalAdmins}</div>
            <div className="stat-label">Administradores</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{totalClientes}</div>
            <div className="stat-label">Clientes</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{totalUsers}</div>
            <div className="stat-label">Usuários ao Total</div>
          </div>
        </div>

        {/* Feedback */}
        <div className="error">{errorMessage}</div>
        <div className="success">{successMessage}</div>

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === "admins" ? "active" : ""}`}
            onClick={() => openTab("admins")}
          >
            👨‍💼 Administradores
          </button>
          <button
            className={`tab ${activeTab === "clientes" ? "active" : ""}`}
            onClick={() => openTab("clientes")}
          >
            👥 Clientes
          </button>
        </div>

        {/* Tab content */}
        {activeTab === "admins" && (
          <div id="admins" className="tab-content active">
            <div className="loading">Carregando administradores...</div>
            <div className="users-grid">{/* render admins aqui */}</div>
          </div>
        )}
        {activeTab === "clientes" && (
          <div id="clientes" className="tab-content active">
            <div className="loading">Carregando clientes...</div>
            <div className="users-grid">{/* render clientes aqui */}</div>
          </div>
        )}
      </div>

      {/* Modal */}
      <div className="modal" id="confirmModal">
        <div className="modal-content">
          <h3>⚠️ Confirmar Exclusão</h3>
          <p>Tem certeza que deseja excluir este usuário?</p>
          <div className="modal-buttons">
            <button className="confirm-btn" onClick={confirmDelete}>🗑️ Excluir</button>
            <button className="cancel-btn" onClick={closeModal}>↩️ Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GerenciarUsers;