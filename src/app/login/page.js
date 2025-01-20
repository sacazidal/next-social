"use client";

import InputForm from "@/components/InputForm";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { NextResponse } from "next/server";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [lastRequestTime, setLastRequestTime] = useState(0);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const { login } = useAuth();

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const currentTime = Date.now();
    if (currentTime - lastRequestTime < 5000) {
      setError("Пожалуйста, подождите 5 секунд перед повторным запросом.");
      return;
    }

    setLastRequestTime(currentTime);
    setIsButtonDisabled(true);

    try {
      const response = await fetch("api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser(data.token);
        if (error) {
          return NextResponse.json(
            { error: "Ошибка при авторизации" },
            { status: 500 }
          );
        }

        login(data.token, data.user);
        router.push("/");
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error(error);
      setError("Произошла ошибка при входе. Пожалуйста, попробуйте снова.");
    } finally {
      setTimeout(() => {
        setIsButtonDisabled(false);
      }, 5000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <form
        onSubmit={handleSubmit}
        className="border-2 rounded-xl border-neutral-700 py-6 px-8 w-full max-w-xl flex flex-col gap-y-3"
      >
        <h2 className="text-center font-bold text-2xl">Вход</h2>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <InputForm
          title={"Логин"}
          type={"text"}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder={"Введите логин"}
        />
        <InputForm
          title={"Пароль"}
          type={"password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={"Введите пароль"}
        />
        <div className="flex w-full items-center justify-center">
          <button
            type="submit"
            disabled={isButtonDisabled}
            className="mt-3 border-2 rounded-lg p-2 w-full md:w-1/2 flex items-center justify-center"
          >
            Войти
          </button>
        </div>
      </form>
    </div>
  );
}
