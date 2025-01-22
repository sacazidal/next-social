"use client";

import { supabase } from "@/app/lib/supabaseClient";
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Ошибка при проверке сессии:", error);
        return;
      }

      if (session) {
        console.log("Текущая сессия:", session);
        setToken(session.access_token);
        setUser(session.user);
      } else {
        console.log("Сессия не найдена");
        setToken(null);
        setUser(null);
      }
    };

    checkSession();
  }, []);

  const login = (newToken, userData) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error signing out:", error);
      return;
    }

    console.log("Пользователь вышел из системы");

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);

    console.log("Сессия после выхода:", { token, user });
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
