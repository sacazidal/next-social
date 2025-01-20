"use client";

import InputForm from "@/components/InputForm";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState("");
  const [lastRequestTime, setLastRequestTime] = useState(0);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

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
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          username,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsModalOpen(true);
        setError("");
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error(error);
      setError("При регистрации произошла ошибка. Попробуйте еще раз.");
    } finally {
      setTimeout(() => {
        setIsButtonDisabled(false);
      }, 5000);
    }
  };

  const handleConfirmation = async () => {
    const currentTime = Date.now();
    if (currentTime - lastRequestTime < 5000) {
      setError("Пожалуйста, подождите 5 секунд перед повторным запросом.");
      return;
    }

    setLastRequestTime(currentTime);
    setIsButtonDisabled(true);

    try {
      const response = await fetch("/api/auth/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code: confirmationCode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push("/login"); // Перенаправляем на страницу входа
      } else {
        setError(data.error || "Неверный код подтверждения");
      }
    } catch (error) {
      setError("Ошибка при подтверждении");
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
        <h2 className="text-center font-bold text-2xl">Регистрация</h2>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <div className="flex flex-col md:flex-row items-center justify-between w-full gap-x-2 gap-y-3">
          <InputForm
            title={"Имя"}
            type={"text"}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder={"Введите имя"}
          />
          <InputForm
            title={"Фамилия"}
            type={"text"}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder={"Введите фамилию"}
          />
        </div>
        <InputForm
          title={"Email"}
          type={"email"}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={"Введите email"}
        />
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
            Зарегистироваться
          </button>
        </div>
      </form>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6 text-center">
              Введите код подтверждения
            </h2>
            <input
              type="text"
              value={confirmationCode}
              onChange={(e) => setConfirmationCode(e.target.value)}
              className="w-full p-2 bg-gray-700 rounded-lg text-white text-center text-2xl"
              maxLength={6}
              placeholder="XXXXXX"
              required
            />
            <button
              onClick={handleConfirmation}
              disabled={isButtonDisabled}
              className="w-full bg-blue-600 text-white p-2 rounded-lg mt-4 hover:bg-blue-700 transition"
            >
              Подтвердить
            </button>
            {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
