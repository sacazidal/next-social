import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 text-white absolute w-full h-full top-0 left-0">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="text-2xl mt-4">Страница не найдена</p>
      <Link
        href="/"
        className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Вернуться на главную
      </Link>
    </div>
  );
}
