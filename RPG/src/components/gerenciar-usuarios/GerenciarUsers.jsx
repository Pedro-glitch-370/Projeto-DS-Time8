import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAtualizarUsuarioLogado } from "../barra-superior/utils/userState";
import Particulas from "../particulas/Particulas";
import "./gerenciarUsers.css";

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
  const [boolDelete, setBoolDelete] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [ativa, setAtiva] = useState(null);
  const toggleTarefa = (id) => {
    setAtiva(ativa === id ? null : id);
  };

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
        setBoolDelete(false);
    };

    const confirmDelete = (type, id, name) => {
        setUserToDelete({ type, id, name });
        setBoolDelete(true);
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
            setUserToDelete(null);
            setBoolDelete(false);
        }
    };

    return (
        <div className="admin-container">
        <div className="conteudo-gerenciar">
            {/* Header */}
            <div className="header-gerenciar">
                <h1>Gerenciar Usuários</h1>
                <p className="user-welcome-gerenciar">Administrador atual: {currentUser?.nome}</p>
            </div>

            {/* Content */}
            <div className="content-gerenciar">
                {/* Stats */}
                <div className="stats-gerenciar">
                <div className="stat-item">
                    <div className="stat-numero">{totalAdmins}</div>
                    <div className="stat-label-concluidas">Administradores</div>
                </div>
                <div className="stat-item">
                    <div className="stat-numero">{totalClientes}</div>
                    <div className="stat-label-concluidas">Clientes</div>
                </div>
                <div className="stat-item">
                    <div className="stat-numero">{totalUsers}</div>
                    <div className="stat-label-concluidas">Usuários ao Total</div>
                </div>
                </div>

                <div className="nav-links">
                    <button className="back-link-gerenciar">↩ Voltar ao Mapa</button>
                    <button className="logout-btn-gerenciar" onClick={logout}>⏻ Sair</button>
                </div>

                {/* Feedback */}
                {errorMessage && <div className="error-gerenciar">{errorMessage}</div>}
                {successMessage && <div className="success-gerenciar">{successMessage}</div>}

                <div className="header-gerenciar" id="segundo-titulo-gerenciar">
                    <h1>Lista de Usuários</h1>
                </div>

                {/* Tabs */}
                <div className="tabs">
                    <button
                        className={`tab ${activeTab === "admins" ? "active" : ""}`}
                        onClick={() => openTab("admins")}
                    >
                        Administradores
                    </button>
                    <button
                        className={`tab ${activeTab === "clientes" ? "active" : ""}`}
                        onClick={() => openTab("clientes")}
                    >
                        Clientes
                    </button>
                </div>

                {/* Tab content */}
                {activeTab === "admins" && (
                    <div id="admins" className="tab-content active">
                        {loadingAdmins ? (
                        <div className="loading-gerenciar">Carregando administradores...</div>
                        ) : admins.length === 0 ? (
                        <div className="empty-state">
                            <h3>📭 Nenhum administrador encontrado</h3>
                            <p>Não há administradores cadastrados no sistema.</p>
                        </div>
                        ) : (
                        <div className="users-grid">
                            {admins.map((admin) => (
                            <div key={admin._id} 
                                className={`user-card ${ativa === admin._id ? "ativa" : ""}`}
                            >
                                <div className="user-info-card">
                                    {/* Parte visível */}
                                    <div className="user-info-visivel">
                                        <div className="user-name-gerenciar">{admin.nome}</div>
                                        <div className="user-actions">
                                            <button
                                                className="info-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleTarefa(admin._id);
                                                }}
                                                >
                                                ℹ️ Info
                                            </button>
                                            <button
                                                className="delete-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    confirmDelete("cliente", admin._id, admin.nome);
                                                }}
                                                >
                                                🗑️ Excluir
                                            </button>
                                        </div>
                                    </div>
                                
                                
                                    {/* Parte revelada */}
                                    <div className="user-details-gerenciar" onClick={() => toggleTarefa(admin._id)}>
                                        <span className="user-stats">📧 {admin.email}</span>
                                        <span className="user-stats">
                                        🛠️ {admin.permissoes ? admin.permissoes.length : 0} permissões
                                        </span>
                                    </div>
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
                        <div className="loading-gerenciar">Carregando clientes...</div>
                        ) : clientes.length === 0 ? (
                        <div className="empty-state">
                            <h3>📭 Nenhum cliente encontrado</h3>
                            <p>Não há clientes cadastrados no sistema.</p>
                        </div>
                        ) : (
                        <div className="users-grid">
                            {clientes.map((cliente) => (
                            <div key={cliente._id}
                                className={`user-card ${ativa === cliente._id ? "ativa" : ""}`}
                            >
                                <div className="user-info-card">
                                    {/* Parte visível */}
                                    <div className="user-info-visivel">
                                        <div className="user-name-gerenciar">{cliente.nome}</div>
                                        <div className="user-actions">
                                            <button
                                                className="info-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleTarefa(cliente._id);
                                                }}
                                                >
                                                ℹ️ Info
                                            </button>
                                            <button
                                                className="delete-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    confirmDelete("cliente", cliente._id, cliente.nome);
                                                }}
                                                >
                                                🗑️ Excluir
                                            </button>
                                        </div>
                                    </div>

                                    {/* Parte revelada */}
                                    <div className="user-details-gerenciar" onClick={() => toggleTarefa(cliente._id)}>
                                        <span className="user-stats">📧 {cliente.email}</span>
                                        <span className="user-stats">🪙 {cliente.capibas || 0} capibas</span>
                                        {cliente.tarefasCompletas ? (
                                        <span className="user-stats">✅ {cliente.tarefasCompletas} tarefas</span>
                                        ) : <span className="user-stats">❗ 0 tarefas</span>}
                                    </div>
                                </div>
                                
                            </div>
                            ))}
                        </div>
                        )}
                    </div>
                )}
            </div>

        {/* Modal */}
        {console.log(boolDelete)}
        {boolDelete && (
            <div className="modal-gerenciar">
                <div className="modal-content">
                <h3>⚠️ Confirmar Exclusão</h3>
                <p>Tem certeza que deseja excluir "{userToDelete.name}" ({userToDelete.type})?<br></br>Esta ação não pode ser desfeita.</p>
                <div className="modal-buttons">
                    <button className="confirm-btn" onClick={handleDeleteUser}>Excluir</button>
                    <button className="cancel-btn" onClick={closeModal}>Cancelar</button>
                </div>
                </div>
            </div>        
        )}
        </div>
        <Particulas />
        </div>
    );
}

export default GerenciarUsers;