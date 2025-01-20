"use client";

import { useRouter } from "next/navigation";

const Header = () => {
  const router = useRouter();
  const linkClick = () => {
    router.push("/");
  };

  return (
    <header className="py-4">
      <div className="container mx-auto w-full">
        <button
          className="flex gap-x-3 items-center justify-center md:justify-start w-full"
          onClick={linkClick}
        >
          <h1 className="text-2xl font-bold">Next Social Network</h1>
        </button>
      </div>
    </header>
  );
};
export default Header;
