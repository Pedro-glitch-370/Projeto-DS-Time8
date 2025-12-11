import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAtualizarUsuarioLogado } from "../barra-superior/utils/userState";
import "../../css/gerenciarUsers.css";

const API_BASE_URL = "http://localhost:5001/api/auth";

const GerenciarUsers = () => {
  const [currentUser, setCurrentUser] = useState(null);

  const [totalAdmins, setTotalAdmins] = useState(0);
  const [admins, setAdmins] = useState([]);

  const [totalClientes, setTotalClientes] = useState(0);
  const [clientes, setClientes] = useState([]);

  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [loadingClientes, setLoadingClientes] = useState(true);

  const [totalUsers, setTotalUsers] = useState(0);
  const [activeTab, setActiveTab] = useState("admins");
  const [userToDelete, setUserToDelete] = useState(null);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();

    // Para segurança
    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (!userData) {
            // Redireciona se não estiver logado
            navigate("/");
            return;
        }

        const parsedUser = JSON.parse(userData);
        if (parsedUser.tipo !== "admin") {
            setErrorMessage("❌ Acesso negado. Apenas administradores podem acessar este painel.");
            setTimeout(() => navigate("/"), 3000);
            return;
        }

        setCurrentUser(parsedUser);
    }, [navigate]);

    useEffect(() => {
    const carregarUsuarios = async () => {
        try {
        console.log("🔄 Iniciando carregamento de usuários...");

        let adminsData = [];
        let clientesData = [];

        // Carregar administradores
        const adminsResponse = await fetch(`${API_BASE_URL}/admins`);
        console.log("📊 Status da resposta admins:", adminsResponse.status);

        if (adminsResponse.ok) {
            adminsData = await adminsResponse.json();
            console.log("👨‍💼 Admins carregados:", adminsData);
            setAdmins(adminsData);
            setTotalAdmins(adminsData.length);
            setLoadingAdmins(false);
        } else {
            const errorText = await adminsResponse.text();
            console.error("❌ Erro detalhado ao carregar admins:", errorText);
            throw new Error(`Erro ${adminsResponse.status}: ${adminsResponse.statusText}`);
        }

        // Carregar clientes
        const clientesResponse = await fetch(`${API_BASE_URL}/clientes`);
        console.log("📊 Status da resposta clientes:", clientesResponse.status);

        if (clientesResponse.ok) {
            clientesData = await clientesResponse.json();
            console.log("👥 Clientes carregados:", clientesData);
            setClientes(clientesData);
            setTotalClientes(clientesData.length);
            setLoadingClientes(false);
        } else {
            const errorText = await clientesResponse.text();
            console.error("❌ Erro detalhado ao carregar clientes:", errorText);
            throw new Error(`Erro ${clientesResponse.status}: ${clientesResponse.statusText}`);
        }

        // Atualizar o total
        setTotalUsers(adminsData.length + clientesData.length);

        console.log("✅ Usuários carregados com sucesso!");
        } catch (error) {
        console.error("❌ Erro completo ao carregar usuários:", error);
        setErrorMessage(`❌ Erro ao carregar usuários: ${error.message}`);
        setLoadingAdmins(false);
        setLoadingClientes(false);
        setAdmins([]);
        setClientes([]);
        }
    };

    carregarUsuarios();
    }, []);

    const logout = () => {
        localStorage.removeItem("user");
        const atualizar = getAtualizarUsuarioLogado();
        atualizar(null);
        alert("Logout realizado!");
        navigate("/");
    };

    const openTab = (tabName) => {
        setActiveTab(tabName);
    };

    const closeModal = () => {
        setUserToDelete(null);
    };

    const confirmDelete = (type, id, name) => {
        setUserToDelete({ type, id, name });
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;

        try {
            const response = await fetch(
            `${API_BASE_URL}/${userToDelete.type}s/${userToDelete.id}`,
            { method: "DELETE" }
            );

            if (response.ok) {
            setSuccessMessage(`✅ ${userToDelete.name} excluído com sucesso!`);

            // Atualizar lista local
            if (userToDelete.type === "admin") {
                setAdmins((prev) => prev.filter((a) => a._id !== userToDelete.id));
                setTotalAdmins((prev) => prev - 1);
            } else {
                setClientes((prev) => prev.filter((c) => c._id !== userToDelete.id));
                setTotalClientes((prev) => prev - 1);
            }

            setTotalUsers((prev) => prev - 1);
            } else {
            const errorText = await response.text();
            setErrorMessage(`❌ Erro ao excluir: ${errorText}`);
            }
        } catch (err) {
            setErrorMessage(`❌ Erro de rede: ${err.message}`);
        } finally {
            setUserToDelete(null); // fecha o modal
        }
    };

    return (
        <div className="admin-container">
        {/* Header */}
        <div className="header-gerenciar">
            <h1>Gerenciar Usuários</h1>
            <div className="user-info-gerenciar">
            <p className="user-welcome-gerenciar">Administrador atual: {currentUser?.nome}</p>
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
                    {loadingAdmins ? (
                    <div className="loading">Carregando administradores...</div>
                    ) : admins.length === 0 ? (
                    <div className="empty-state">
                        <h3>📭 Nenhum administrador encontrado</h3>
                        <p>Não há administradores cadastrados no sistema.</p>
                    </div>
                    ) : (
                    <div className="users-grid">
                        {admins.map((admin) => (
                        <div className="user-card" key={admin._id}>
                            <div className="user-info-card">
                            <div className="user-name">{admin.nome}</div>
                            <div className="user-email">📧 {admin.email}</div>
                            <div className="user-details">
                                <span className="user-type admin">👑 Administrador</span>
                                <span className="user-stats">
                                🛠️ {admin.permissoes ? admin.permissoes.length : 0} permissões
                                </span>
                            </div>
                            </div>
                            <div className="user-actions">
                            <button
                                className="delete-btn"
                                onClick={() => confirmDelete("admin", admin._id, admin.nome)}
                            >
                                🗑️ Excluir
                            </button>
                            </div>
                        </div>
                        ))}
                    </div>
                    )}
                </div>
            )}
            {activeTab === "clientes" && (
                <div id="clientes" className="tab-content active">
                    {loadingClientes ? (
                    <div className="loading">Carregando clientes...</div>
                    ) : clientes.length === 0 ? (
                    <div className="empty-state">
                        <h3>📭 Nenhum cliente encontrado</h3>
                        <p>Não há clientes cadastrados no sistema.</p>
                    </div>
                    ) : (
                    <div className="users-grid">
                        {clientes.map((cliente) => (
                        <div className="user-card" key={cliente._id}>
                            <div className="user-info-card">
                            <div className="user-name">{cliente.nome}</div>
                            <div className="user-email">📧 {cliente.email}</div>
                            <div className="user-details">
                                <span className="user-type cliente">👤 Cliente</span>
                                <span className="user-stats">🪙 {cliente.capibas || 0} capibas</span>
                                {cliente.tarefasCompletas && (
                                <span className="user-stats">
                                    ✅ {cliente.tarefasCompletas} tarefas
                                </span>
                                )}
                            </div>
                            </div>
                            <div className="user-actions">
                            <button
                                className="delete-btn"
                                onClick={() =>
                                confirmDelete("cliente", cliente._id, cliente.nome)
                                }
                            >
                                🗑️ Excluir
                            </button>
                            </div>
                        </div>
                        ))}
                    </div>
                    )}
                </div>
            )}
        </div>

        {/* Modal */}
        {userToDelete && (
            <div className="modal-gerenciar" id="confirmModal">
                <div className="modal-content">
                <h3>⚠️ Confirmar Exclusão</h3>
                <p>Tem certeza que deseja excluir "{userToDelete.name}" ({userToDelete.type})?<br></br>Esta ação não pode ser desfeita.</p>
                <div className="modal-buttons">
                    <button className="confirm-btn" onClick={handleDeleteUser}>🗑️ Excluir</button>
                    <button className="cancel-btn" onClick={closeModal}>↩️ Cancelar</button>
                </div>
                </div>
            </div>        
        )}
        </div>
    );
}

export default GerenciarUsers;