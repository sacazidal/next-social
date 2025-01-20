import ProtectedRoute from "@/components/ProtectedRoute";

export default function Home() {
  return (
    <ProtectedRoute>
      <>Ваш профиль</>
    </ProtectedRoute>
  );
}
