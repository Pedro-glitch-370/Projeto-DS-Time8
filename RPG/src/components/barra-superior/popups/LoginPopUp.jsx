import { useState } from "react";
import { isValidEmail } from "../para-react/isValidEmail";
import { authService } from "../../../services/authService";
import "./loginPopUp.css";

export default function LoginPopup({ onClose, onLoginSuccess, abrirRegistro }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagemErro, setMensagemErro] = useState("");
  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setMensagemErro("");
    setMensagemSucesso("");
    setLoading(true);

    if (!isValidEmail(email)) {
      setMensagemErro("Por favor, insira um email válido");
      setLoading(false);
      return;
    }
    if (!senha) {
      setMensagemErro("Por favor, insira sua senha");
      setLoading(false);
      return;
    }

    try {
      const userData = await authService.login(email, senha);
      if (!userData || !userData.token) {
        setMensagemErro("Falha no login: token não recebido");
        return;
      }

      // salva no localStorage
      localStorage.setItem("user", JSON.stringify(userData));

      // avisa o Navbar que o login deu certo
      if (onLoginSuccess) onLoginSuccess(userData);
      setMensagemSucesso("Login realizado com sucesso!");

      // fecha popup
      onClose();
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

        {mensagemErro && <div className="error">{mensagemErro}</div>}
        {mensagemSucesso && <div className="success">{mensagemSucesso}</div>}
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
