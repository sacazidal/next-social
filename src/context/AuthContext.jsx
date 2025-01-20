"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabaseClient"; // Импортируйте Supabase

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      if (typeof window !== "undefined") {
        const storedToken = localStorage.getItem("token");
        const storedUser = JSON.parse(localStorage.getItem("user"));

        if (storedToken && storedUser) {
          // Проверяем сессию на сервере
          const {
            data: { session },
            error,
          } = await supabase.auth.getSession();

          if (error || !session) {
            console.error("Сессия не найдена или произошла ошибка:", error);
            // Очищаем localStorage и состояние
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setToken(null);
            setUser(null);
            return;
          }

          // Сессия действительна, обновляем состояние
          setToken(storedToken);
          setUser(storedUser);
        }
      }
    };

    checkSession();
  }, []);

  const login = async (newToken, userData) => {
    if (typeof window !== "undefined") {
      // Сохраняем токен и данные пользователя в localStorage
      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(userData));
    }

    // Обновляем состояние
    setToken(newToken);
    setUser(userData);

    // Проверяем сессию
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error("Ошибка при проверке сессии:", error);
      return;
    }

    if (!session) {
      console.error("Сессия не найдена");
      return;
    }

    console.log("Пользователь успешно авторизован:", session);
  };

  const logout = async () => {
    if (typeof window !== "undefined") {
      // Выход из Supabase
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Ошибка при выходе:", error);
        return;
      }

      // Очищаем токен и данные пользователя из localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }

    // Сбрасываем состояние
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
