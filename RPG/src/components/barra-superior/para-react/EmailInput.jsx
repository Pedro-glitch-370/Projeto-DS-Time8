import { useState } from "react";
import { isValidEmail } from "./isValidEmail";

export function EmailInput() {
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [status, setStatus] = useState("");

  function validarEmail() {
    if (!email) {
      setMensagem("Email é obrigatório");
      setStatus("error");
      return false;
    }
    if (!isValidEmail(email)) {
      setMensagem("Por favor, insira um email válido (ex: nome@provedor.com)");
      setStatus("error");
      return false;
    }
    setMensagem("Email válido");
    setStatus("success");
    return true;
  }

  return (
    <div className="form-group">
      <label>Email *</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onBlur={validarEmail}
        className={status}
      />
      <div className={`validation-message ${status}`}>{mensagem}</div>
    </div>
  );
}
