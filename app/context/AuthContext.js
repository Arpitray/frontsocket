"use client";
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

function parseJwt(token) {
  try {
    const b64 = token.split('.')[1];
    const json = atob(b64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}
export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    const t = localStorage.getItem("token");
    if (t) {
      setToken(t);
      const p = parseJwt(t);
      if (p) setUser({ name: p.name || p.username || null, email: p.email || null });
    }
  }, []);

  function login(t) {
    localStorage.setItem("token", t);
    setToken(t);
    const p = parseJwt(t);
    if (p) setUser({ name: p.name || p.username || null, email: p.email || null });
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }

  // Avoid rendering until client mounts (prevents hydration mismatch)
  if (!mounted) return null;

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
