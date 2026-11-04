import { createContext, useContext } from "react";

export const authContext = createContext(null);

export function useAuth() {
  return useContext(authContext);
}
