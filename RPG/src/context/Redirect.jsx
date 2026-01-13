import { Navigate } from "react-router-dom";
import { useUser } from "./ExportsContext";

export default function Redirect({ children }) {
  const { usuarioLogado } = useUser();

  if (!usuarioLogado) {
    alert("⚠️ Você precisa estar logado para acessar essa página!");
    return <Navigate to="/" replace />;
  }

  return children;
}
