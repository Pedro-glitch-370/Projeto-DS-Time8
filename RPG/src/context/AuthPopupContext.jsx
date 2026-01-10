import { createContext, useState } from "react";

export const AuthPopupContext = createContext();

export function AuthPopupProvider({ children }) {
  const [loginPopupAberto, setLoginPopupAberto] = useState(false);
  const [registerPopupAberto, setRegisterPopupAberto] = useState(false);

  return (
    <AuthPopupContext.Provider value={{
      loginPopupAberto,
      setLoginPopupAberto,
      registerPopupAberto,
      setRegisterPopupAberto
    }}>
      {children}
    </AuthPopupContext.Provider>
  );
}
