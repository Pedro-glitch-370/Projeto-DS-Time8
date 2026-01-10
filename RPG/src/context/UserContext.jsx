import { createContext, useState, useEffect } from "react";
import { authService } from "../services/authService";

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [userMenuAberto, setUserMenuAberto] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUsuarioLogado(JSON.parse(savedUser));
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
