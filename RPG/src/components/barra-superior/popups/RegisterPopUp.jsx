import { useState } from "react";
import { isValidEmail } from "../para-react/isValidEmail";
import "./registerPopUp.css";

export default function RegisterPopup({ onClose, abrirLogin }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [tipo, setTipo] = useState("cliente");
  const [mensagemErro, setMensagemErro] = useState("");
  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = "http://localhost:5001/api";

  async function handleRegister(e) {
    e.preventDefault();
    setMensagemErro("");
    setMensagemSucesso("");

    if (!nome) {
      setMensagemErro("Por favor, informe seu nome completo");
      return;
    }

    if (!isValidEmail(email)) {
      setMensagemErro("Por favor, insira um email válido");
      return;
    }

    if (!senha) {
      setMensagemErro("Por favor, digite uma senha");
      return;
    }

    setLoading(true);

    try {
      // rota depende do tipo
      const rota = tipo === "admin" ? "/auth/admins/register/" : "/auth/clientes/register/";
      console.log("ENVIANDO AO BACKEND:", { nome, email, senha });
      const response = await fetch(`${API_BASE_URL}${rota}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, senha })
      });

      const data = await response.json();
      console.log("DATA:", data);

      if (response.ok) {
        setMensagemSucesso("Registro realizado com sucesso! Redirecionando para login...");
        setTimeout(() => {
          onClose();
          abrirLogin();
        }, 2000);
      } else {
        setMensagemErro(data.message || "Erro no registro. Tente novamente.");
      }
    } catch (error) {
      setMensagemErro(`❌ Erro ${error} durante o registro. Tente novamente.`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="popup-register" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="popup-content">
        <span className="close-popup" onClick={onClose}>&times;</span>
        <h2>Criar Conta</h2>
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label>Nome *</label>
            <input value={nome} onChange={(e) => setNome(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Senha *</label>
            <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Tipo de usuário *</label>
            <div className="user-type-register">
              <label>
                <input type="radio" value="cliente" checked={tipo === "cliente"} onChange={() => setTipo("cliente")} />
                <span >{tipo === "cliente" ? "✓ Cliente" : "Cliente"}</span>
              </label>
              <label>
                <input type="radio" value="admin" checked={tipo === "admin"} onChange={() => setTipo("admin")} />
                <span>{tipo === "admin" ? "✓ Admin" : "Admin"}</span>
              </label>
            </div>
          </div>
          <button type="submit" disabled={loading}>Registrar</button>
        </form>

        {mensagemErro && <div className="error-register">{mensagemErro}</div>}
        {mensagemSucesso && <div className="success-register">{mensagemSucesso}</div>}
        {loading && <div className="loading-register">Registrando...</div>}

        <div className="register-link-container">
          <a className="register-link" href="#" onClick={(e) => { e.preventDefault(); onClose(); abrirLogin(); }}>
            Já tem uma conta? Faça login
          </a>
        </div>
      </div>
    </div>
  );
}
