import React from "react";
import { Link } from "react-router-dom";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import WelcomeCard from "@/components/WelcomeCard";
import { showSuccess } from "@/utils/toast";

const Index: React.FC = () => {
  const { user, profile, signOut } = useAuth();

  React.useEffect(() => {
    // Show a one-time welcome toast after login
    if (user && !localStorage.getItem("app_welcomed")) {
      showSuccess(`Bem-vindo, ${user.email}`);
      localStorage.setItem("app_welcomed", "1");
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <WelcomeCard />

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold">Minha Aplicação</h2>
            <p className="text-gray-700 mt-2">
              Sistema com autenticação e permissões (Supabase).
            </p>

            <div className="mt-4">
              {user ? (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{user.email}</div>
                    <div className="text-sm text-gray-500">{profile?.role ?? "USER"}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to="/login"
                      className="px-3 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 text-sm"
                    >
                      Gerenciar conta
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                      Sair
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="inline-block px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  Entrar / Criar conta
                </Link>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold">Links rápidos</h3>
            <div className="mt-3 space-y-2 text-sm">
              <Link to="/" className="text-sky-600 hover:underline block">
                Home
              </Link>
              <a href="https://app.supabase.com" target="_blank" rel="noreferrer" className="text-sky-600 hover:underline block">
                Painel Supabase
              </a>
            </div>

            <div className="mt-6">
              <MadeWithDyad />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;