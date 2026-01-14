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
        <section className="conteudo-gerenciar">
            {/* Header */}
            <header className="header-gerenciar">
                <h1>Gerenciar Usuários</h1>
                <p className="user-welcome-gerenciar">Administrador atual: {currentUser?.nome}</p>
            </header>

            {/* Content */}
            <article className="content-gerenciar">
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
            </article>

            {/* Botões de navegação */}
            <section className="nav-links">
                <button className="back-link-gerenciar">Voltar ao Mapa</button>
                <button className="logout-btn-gerenciar" onClick={logout}>Sair</button>
            </section>
        </section>

        <section className="conteudo-gerenciar">
                {/* Feedback */}
                {errorMessage && <div className="error-gerenciar">{errorMessage}</div>}
                {successMessage && <div className="success-gerenciar">{successMessage}</div>}

                <header className="header-gerenciar">
                    <h1>Lista de Usuários</h1>
                </header>

                {/* Tabs */}
                <section className="tabs">
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
                </section>

                {/* Tab content */}
                {activeTab === "admins" && (
                    <section id="admins" className="tab-content active">
                        {loadingAdmins ? (
                        <div className="loading-gerenciar">Carregando administradores...</div>
                        ) : admins.length === 0 ? (
                        <div className="empty-state">
                            <h3>📭 Nenhum administrador encontrado</h3>
                            <p>Não há administradores cadastrados no sistema.</p>
                        </div>
                        ) : (
                        <article className="users-grid">
                            {admins.map((admin) => (
                            <div key={admin._id} 
                                className={`user-card ${ativa === admin._id ? "ativa" : ""}`}
                            >
                                <div className="user-info-card">
                                    {/* Parte visível */}
                                    <section className="user-info-visivel"
                                         onClick={(e) => {
                                            e.stopPropagation();
                                            toggleTarefa(admin._id);
                                         }}
                                    >
                                        <div className="user-name-gerenciar">{admin.nome}</div>
                                        <div className="user-actions">
                                            <button
                                                className="delete-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    confirmDelete("cliente", admin._id, admin.nome);
                                                }}
                                                >
                                                Excluir
                                            </button>
                                        </div>
                                    </section>
                                
                                
                                    {/* Parte revelada */}
                                    <section className="user-details-gerenciar" onClick={() => toggleTarefa(admin._id)}>
                                        <span className="user-stats">📧 {admin.email}</span>
                                        <span className="user-stats">
                                        🛠️ {admin.permissoes ? admin.permissoes.length : 0} permissões
                                        </span>
                                    </section>
                                </div>
                                
                            </div>
                            ))}
                        </article>
                        )}
                    </section>
                )}
                {activeTab === "clientes" && (
                    <section id="clientes" className="tab-content active">
                        {loadingClientes ? (
                        <div className="loading-gerenciar">Carregando clientes...</div>
                        ) : clientes.length === 0 ? (
                        <div className="empty-state">
                            <h3>📭 Nenhum cliente encontrado</h3>
                            <p>Não há clientes cadastrados no sistema.</p>
                        </div>
                        ) : (
                        <article className="users-grid">
                            {clientes.map((cliente) => (
                            <div key={cliente._id}
                                className={`user-card ${ativa === cliente._id ? "ativa" : ""}`}
                            >
                                <div className="user-info-card">
                                    {/* Parte visível */}
                                    <section className="user-info-visivel"
                                         onClick={(e) => {
                                            e.stopPropagation();
                                            toggleTarefa(cliente._id);
                                         }}
                                    >
                                        <div className="user-name-gerenciar">{cliente.nome}</div>
                                        <div className="user-actions">
                                            <button
                                                className="delete-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    confirmDelete("cliente", cliente._id, cliente.nome);
                                                }}
                                                >
                                                Excluir
                                            </button>
                                        </div>
                                    </section>

                                    {/* Parte revelada */}
                                    <section className="user-details-gerenciar" onClick={() => toggleTarefa(cliente._id)}>
                                        <span className="user-stats">📧 {cliente.email}</span>
                                        <span className="user-stats">🪙 {cliente.capibas || 0} capibas</span>
                                        {cliente.tarefasCompletas ? (
                                        <span className="user-stats">✅ {cliente.tarefasCompletas} tarefas</span>
                                        ) : <span className="user-stats">❗ 0 tarefas</span>}
                                    </section>
                                </div>
                                
                            </div>
                            ))}
                        </article>
                        )}
                    </section>
                )}
        </section>

        {/* Modal */}
        {boolDelete && (
            <div className="modal-gerenciar">
                <section className="modal-content">
                    <h3>⚠️ Confirmar Exclusão</h3>
                    <p>Tem certeza que deseja excluir "{userToDelete.name}" ({userToDelete.type})?<br></br>Esta ação não pode ser desfeita.</p>
                    <section className="modal-buttons">
                        <button className="confirm-btn" onClick={handleDeleteUser}>Excluir</button>
                        <button className="cancel-btn" onClick={closeModal}>Cancelar</button>
                    </section>
                </section>
            </div>        
        )}
        <Particulas />
        </div>
    );
}

export default GerenciarUsers;