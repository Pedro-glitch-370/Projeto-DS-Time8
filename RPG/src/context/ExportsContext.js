import { useContext } from "react";
import { AuthPopupContext } from "./AuthPopupContext";
import { UserContext } from "./UserContext";

export function useAuthPopup() {
  return useContext(AuthPopupContext);
}

export function useUser() {
  return useContext(UserContext);
}