import { useState } from "react";
import { isValidEmail } from "../para-react/isValidEmail";

export default function RegisterPopup({ onClose, abrirLogin }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
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

    setLoading(true);

    try {
      // rota depende do tipo
      const rota = tipo === "admin" ? "/auth/admins/register" : "/auth/clientes/register";
      const response = await fetch(`${API_BASE_URL}${rota}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email })
      });

      const data = await response.json();

      if (response.ok) {
        setMensagemSucesso("✅ Registro realizado com sucesso! Redirecionando para login...");
        setTimeout(() => {
          onClose();
          abrirLogin();
        }, 2000);
      } else {
        setMensagemErro(data.message || "❌ Erro no registro. Tente novamente.");
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
            <input value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Tipo de usuário *</label>
            <div className="user-type">
              <label>
                <input type="radio" value="cliente" checked={tipo === "cliente"} onChange={() => setTipo("cliente")} />
                <span>{tipo === "cliente" ? "✓ Cliente" : "Cliente"}</span>
              </label>
              <label>
                <input type="radio" value="admin" checked={tipo === "admin"} onChange={() => setTipo("admin")} />
                <span>{tipo === "admin" ? "✓ Admin" : "Admin"}</span>
              </label>
            </div>
          </div>
          <button type="submit" disabled={loading}>Registrar</button>
        </form>

        {mensagemErro && <div className="error">{mensagemErro}</div>}
        {mensagemSucesso && <div className="success">{mensagemSucesso}</div>}
        {loading && <div className="loading">Registrando...</div>}

        <div className="register-link-container">
          <a className="register-link" href="#" onClick={(e) => { e.preventDefault(); onClose(); abrirLogin(); }}>
            Já tem uma conta? Faça login
          </a>
        </div>
      </div>
    </div>
  );
}
