import { createContext, useState, useEffect } from "react";
import { authService } from "../services/authService";

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [userMenuAberto, setUserMenuAberto] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser && savedUser !== "undefined" && savedUser !== "null") {
      try {
        setUsuarioLogado(JSON.parse(savedUser));
      } catch (err) {
        console.error("Erro ao parsear usuário:", err);
        localStorage.removeItem("user");
      }
    }
  }, []);

  const login = (userData) => {
    setUsuarioLogado(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    authService.logout();
    setUsuarioLogado(null);
    localStorage.removeItem("user");
  };

  return (
    <UserContext.Provider value={{
      usuarioLogado,
      setUsuarioLogado,
      userMenuAberto,
      setUserMenuAberto,
      login,
      logout
    }}>
      {children}
    </UserContext.Provider>
  );
}
