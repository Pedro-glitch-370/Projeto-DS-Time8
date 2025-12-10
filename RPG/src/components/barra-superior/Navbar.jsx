import { useState } from "react";
import { getUserInitials } from "./para-react/userUtils";
import LoginPopup from "./popups/LoginPopUp";
import RegisterPopup from "./popups/RegisterPopUp";
import UserMenu from "./menu/UserMenu";
import SettingsMenu from "./menu/SettingsMenu";
import { NavLink, useNavigate } from "react-router-dom";

import "./navbar.css";

export default function Navbar() {
    const [loginPopupAberto, setLoginPopupAberto] = useState(false);
    const [registerPopupAberto, setRegisterPopupAberto] = useState(false);
    const [userMenuAberto, setUserMenuAberto] = useState(false);
    const [settingsMenuAberto, setSettingsMenuAberto] = useState(false);
    const [usuarioLogado, setUsuarioLogado] = useState(null);

    const navigate = useNavigate();

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
            <NavLink to="/capibas" className={({ isActive }) => isActive ? "ativo" : ""}>Capibas</NavLink>
        </div>

        <div className="direita">
            <div id="userSection">
                {usuarioLogado ? (
                    <div 
                    className="user-welcome" 
                    onClick={() => setUserMenuAberto(true)}
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

        <div className="opcoes" id="opcoes" onClick={() => setSettingsMenuAberto(true)}>
            <div></div><div></div><div></div>
        </div>

        {loginPopupAberto && (
            <LoginPopup
                onClose={() => setLoginPopupAberto(false)}
                onLoginSuccess={(userData) => setUsuarioLogado(userData)}
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
                onClose={() => setUserMenuAberto(false)}
                onLogout={() => {
                localStorage.removeItem("user");
                setUsuarioLogado(null);
                }}
            />
        )}

        {settingsMenuAberto && (
            <SettingsMenu onClose={() => setSettingsMenuAberto(false)} />
        )}

        </nav>
    );
}