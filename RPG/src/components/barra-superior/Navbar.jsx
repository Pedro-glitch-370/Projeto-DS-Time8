import { Link } from "react-router-dom";
import "./barra-superior.css";

export default function Navbar() {
    return (
        <nav className="barra-superior">
        <div className="esquerda">
            <img 
            src="/src/assets/LogoConecta.png" 
            alt="Logo" 
            className="logo-img"
            />
        </div>
        <div className="meio">
            <Link to="/">Mapa</Link>
            <Link to="/tarefas">Minhas Tarefas</Link>
            <Link to="/capibas">Capibas</Link>
        </div>
        <div className="direita">
            <div id="userSection">
            <a href="#" id="login">Entrar</a>
            </div>
            <div className="opcoes" id="opcoes">
            <div></div>
            <div></div>
            <div></div>
            </div>
        </div>
        </nav>
    );
}