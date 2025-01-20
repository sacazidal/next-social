"use client";

import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Header = () => {
  const router = useRouter();
  const { token, user, logout } = useAuth();

  const linkClick = () => {
    router.push("/");
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="py-4">
      <div className="container mx-auto w-full flex flex-col md:flex-row justify-between items-center gap-y-3 px-5 lg:px-0">
        <button
          className="flex gap-x-3 items-center justify-center md:justify-start"
          onClick={linkClick}
        >
          <Image src={"../NextjsIcon.svg"} alt="Image" width={50} height={50} />
          <h1 className="text-xl lg:text-2xl font-bold">Next Social Network</h1>
        </button>
        <div className="flex items-center justify-between gap-x-4">
          {token ? (
            <>
              <span className="text-lg font-semibold">
                {user?.first_name} {user?.last_name}
              </span>
              <button
                className="border-2 py-2 px-5 rounded-lg"
                onClick={handleLogout}
              >
                Выход
              </button>
            </>
          ) : (
            <>
              <button className="border-2 py-2 px-5 rounded-lg">
                <Link href={"/login"}>Вход</Link>
              </button>
              <button className="border-2 py-2 px-5 rounded-lg">
                <Link href={"/register"}>Регистрация</Link>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
export default Header;
