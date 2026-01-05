import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import UserMenu from "@/components/UserMenu";

const Header: React.FC = () => {
  const { user, profile } = useAuth();

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
              <div className="hidden md:block text-right">
                <div className="text-sm font-medium">{user.email}</div>
                <div className="text-xs text-gray-500">{profile?.role ?? "USER"}</div>
              </div>

              <UserMenu />
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