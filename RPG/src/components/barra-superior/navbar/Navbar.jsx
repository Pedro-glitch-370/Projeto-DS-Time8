import { useState, useEffect } from "react";
import { getUserInitials, isUserAdmin } from "../para-react/userUtils";
import LoginPopup from "../popups/LoginPopUp";
import RegisterPopup from "../popups/RegisterPopUp";
import UserMenu from "../menu/UserMenu";
import SettingsMenu from "../menu/SettingsMenu";
import MenuLateral from "../../barra-lateral/menu-lateral/MenuLateral";
import { NavLink, useNavigate } from "react-router-dom";
import { setAtualizarUsuarioLogado } from "../utils/userState";
import { authService } from "../../../services/authService";
import { clienteService } from "../../../services/clienteService";
import "../../../css/navbar.css";

export default function Navbar() {
    const [loginPopupAberto, setLoginPopupAberto] = useState(false);
    const [registerPopupAberto, setRegisterPopupAberto] = useState(false);
    const [userMenuAberto, setUserMenuAberto] = useState(false);
    const [settingsMenuAberto, setSettingsMenuAberto] = useState(false);
    const [menuLateralAberto, setMenuLateralAberto] = useState(false);
    const [usuarioLogado, setUsuarioLogado] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
            setUsuarioLogado(JSON.parse(savedUser));
        }
        setAtualizarUsuarioLogado(setUsuarioLogado);
    }, []);

    // Função para atualizar dados do usuário (ex: quando ganha pontos no grupo)
    const atualizarUsuario = async () => {
        if (usuarioLogado?.id) {
            try {
                const res = await clienteService.getCliente(usuarioLogado.id);
                if (res.user) {
                    setUsuarioLogado(res.user);
                    authService.setUser(res.user); // Atualiza localStorage
                }
            } catch (error) {
                console.error("Erro ao atualizar usuário:", error);
            }
        }
    };

    return (
        <nav className="barra-superior">

        <div className="esquerda">
            <img 
            src="/src/assets/LogoConecta.png" 
            alt="Logo" 
            className="logo-img"
            onClick={() => navigate("/")}
            />
        </div>

        <div className="meio">
            <NavLink to="/" className={({ isActive }) => isActive ? "ativo" : ""}>Mapa</NavLink>
            <NavLink to="/tarefas" className={({ isActive }) => isActive ? "ativo" : ""}>Minhas Tarefas</NavLink>
            <NavLink to="/tutorial" className={({ isActive }) => isActive ? "ativo" : ""}>Tutorial</NavLink>
        </div>

        <div className="direita">
            <div id="userSection">
                {usuarioLogado ? (
                    <div 
                    className="user-welcome" 
                    onClick={() => setUserMenuAberto(prev => !prev)}
                    >
                    <span className="user-avatar-small">{getUserInitials()}</span>
                    <span className="user-name-small">Olá, {usuarioLogado.nome}</span>
                    </div>
                ) : (
                    <a href="#" id="login" onClick={(e) => { e.preventDefault(); setLoginPopupAberto(true); }}>
                    Entrar
                    </a>
                )}
            </div>
        </div>

        <div className="opcoes" id="opcoes" onClick={() => {
            if (isUserAdmin()) {
                // Se for Admin, abre as Configurações (Edição de Pinos)
                setSettingsMenuAberto(true);
            } else {
                // Se for Usuário Comum, abre o Menu Lateral (Grupos/Clãs)
                setMenuLateralAberto(true);
            }
        }}>
            <div></div><div></div><div></div>
        </div>

        {loginPopupAberto && (
            <LoginPopup
                onClose={() => setLoginPopupAberto(false)}
                onLoginSuccess={(userData) => {
                    const nomeDerivado = userData.nome && userData.nome.trim() !== ""
                    ? userData.nome : userData.email.split("@")[0];

                    const usuario = {
                        ...userData,
                        nome: nomeDerivado,
                        iniciais: nomeDerivado[0].toUpperCase(),
                    };

                    setUsuarioLogado(usuario);
                    localStorage.setItem("user", JSON.stringify(usuario));
                    setUserMenuAberto(false);
                }}
                abrirRegistro={() => { setLoginPopupAberto(false); setRegisterPopupAberto(true); }}
            />
        )}

        {registerPopupAberto && (
            <RegisterPopup
                onClose={() => setRegisterPopupAberto(false)}
                abrirLogin={() => setLoginPopupAberto(true)}
            />
        )}

        {userMenuAberto && usuarioLogado && (
            <UserMenu
                usuarioLogado={usuarioLogado}
                abaLoginAberta={loginPopupAberto}
                onClose={() => setUserMenuAberto(false)}
                onLogout={() => {
                authService.logout();
                setUsuarioLogado(null);
                }}
            />
        )}

        {settingsMenuAberto && (
            <SettingsMenu onClose={() => setSettingsMenuAberto(false)} />
        )}

        <MenuLateral 
            isOpen={menuLateralAberto} 
            onClose={() => setMenuLateralAberto(false)} 
            user={usuarioLogado}
            atualizarUsuario={atualizarUsuario}
        />

        </nav>
    );
}