import { useState } from "react";
import { isValidEmail } from "../para-react/isValidEmail";
import { authService } from "../../../services/authService";
import "./loginPopUp.css";

export default function LoginPopup({ onClose, onLoginSuccess, abrirRegistro }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagemErro, setMensagemErro] = useState("");
  const [exibirErro, setExibirErro] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [exibirSucesso, setExibirSucesso] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setMensagemErro("");
    setExibirErro(false);
    setMensagemSucesso("");
    setExibirSucesso(false);
    setLoading(true);

    if (!isValidEmail(email)) {
      setMensagemErro("Por favor, insira um email válido");
      setExibirErro(true);
      setLoading(false);
      return;
    }
    if (!senha) {
      setMensagemErro("Por favor, insira sua senha");
      setExibirErro(true);
      setLoading(false);
      return;
    }

    try {
      const userData = await authService.login(email, senha);
      if (!userData) {
        setMensagemErro("Falha no login: usuário não recebido");
        setExibirErro(true);
        return;
      }

      // salva no localStorage
      localStorage.setItem("user", JSON.stringify(userData));

      // avisa o Navbar que o login deu certo
      if (onLoginSuccess) onLoginSuccess(userData);
      setMensagemSucesso("Login realizado com sucesso!");
      setExibirSucesso(true);

      // fecha popup
      setTimeout(() => {
        onClose();
      }, 3000);
      
    } catch (error) {
      setMensagemErro(error.message || "Erro ao fazer login. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="popup-login" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="popup-content">
        <span className="close-popup" onClick={onClose}>&times;</span>
        <h2>Entrar</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </div>
          <div className="form-group">
            <label>Senha *</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="sua senha"
              required
            />
          </div>
          <button type="submit" disabled={loading}>Entrar</button>
        </form>

        {exibirErro && !exibirSucesso && <div className="error">{mensagemErro}</div>}
        {exibirSucesso && !exibirErro && <div className="success">{mensagemSucesso}</div>}
        {loading && <div className="loading">Entrando...</div>}

        <div className="register-link-container">
          <a className="register-link" href="#" onClick={(e) => { e.preventDefault(); abrirRegistro(); }}>
            Não tem conta? Registre-se
          </a>
        </div>
      </div>
    </div>
  );
}
