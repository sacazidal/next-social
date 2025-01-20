"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

const Header = () => {
  const router = useRouter();
  const linkClick = () => {
    router.push("/");
  };

  return (
    <header className="py-4">
      <div className="container mx-auto w-full flex flex-col md:flex-row justify-between items-center gap-y-3">
        <button
          className="flex gap-x-3 items-center justify-center md:justify-start w-full"
          onClick={linkClick}
        >
          <h1 className="text-2xl font-bold">Next Social Network</h1>
        </button>
        <div className="flex items-center justify-between gap-x-4">
          <button className="border-2 py-2 px-5 rounded-lg">
            <Link href={"/login"}>Вход</Link>
          </button>
          <button className="border-2 py-2 px-5 rounded-lg">
            <Link href={"/register"}>Регистрация</Link>
          </button>
        </div>
      </div>
    </header>
  );
};
export default Header;
