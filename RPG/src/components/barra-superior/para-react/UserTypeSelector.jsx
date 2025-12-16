import { useState } from "react";
import "./userType.css";

export default function UserTypeSelector({ tipoInicial = "cliente", onChange }) {
  const [tipo, setTipo] = useState(tipoInicial);

  function handleChange(novoTipo) {
    setTipo(novoTipo);
    if (onChange) onChange(novoTipo);
  }

  return (
    <div className="user-type">
      <label className={tipo === "cliente" ? "selected" : ""}>
        <input
          type="radio"
          name="tipo"
          value="cliente"
          checked={tipo === "cliente"}
          onChange={() => handleChange("cliente")}
        />
        <span>{tipo === "cliente" ? "✓ Cliente" : "Cliente"}</span>
      </label>

      <label className={tipo === "admin" ? "selected" : ""}>
        <input
          type="radio"
          name="tipo"
          value="admin"
          checked={tipo === "admin"}
          onChange={() => handleChange("admin")}
        />
        <span>{tipo === "admin" ? "✓ Admin" : "Admin"}</span>
      </label>
    </div>
  );
}
