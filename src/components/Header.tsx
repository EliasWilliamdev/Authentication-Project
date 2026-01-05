import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { showSuccess, showError } from "@/utils/toast";

const Header: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const res = await signOut();
    // @ts-ignore
    if (res?.error) {
      showError(res.error.message || "Erro ao sair");
      return;
    }
    showSuccess("Você saiu com sucesso.");
    navigate("/login", { replace: true });
  };

  return (
    <header className="w-full bg-white border-b">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link to="/" className="text-xl font-semibold text-sky-600 hover:text-sky-700">
            Minha Aplicação
          </Link>
          <span className="text-sm text-gray-500">— Sistema com Supabase</span>
        </div>

        <nav className="flex items-center space-x-4">
          <Link to="/" className="text-sm text-gray-700 hover:underline">
            Home
          </Link>

          {user ? (
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm font-medium">{user.email}</div>
                <div className="text-xs text-gray-500">{profile?.role ?? "USER"}</div>
              </div>

              <button
                onClick={() => navigate("/profile")}
                className="px-3 py-1.5 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 text-sm"
                title="Ver/Editar perfil"
              >
                Perfil
              </button>

              <button
                onClick={() => navigate("/")}
                className="px-3 py-1.5 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 text-sm"
                title="Ir para o dashboard"
              >
                Dashboard
              </button>

              <button
                onClick={handleSignOut}
                className="px-3 py-1.5 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                title="Sair"
              >
                Sair
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                Entrar / Criar conta
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;