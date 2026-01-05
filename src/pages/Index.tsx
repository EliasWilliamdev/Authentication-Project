import React from "react";
import { Link } from "react-router-dom";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { useAuth } from "@/hooks/useAuth";

const Index: React.FC = () => {
  const { user, profile, signOut } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-3xl w-full bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Minha Aplicação</h1>
            <p className="text-gray-600">Sistema com autenticação e permissões (Supabase)</p>
          </div>

          <div>
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="font-medium">{user.email}</div>
                  <div className="text-sm text-gray-500">{profile?.role ?? "USER"}</div>
                </div>
                <button
                  onClick={() => signOut()}
                  className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Sair
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Entrar / Criar conta
              </Link>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Sobre</h2>
            <p className="text-gray-700">
              Este projeto mostra um fluxo de autenticação com Supabase, tabelas de perfis e roles.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium">Links rápidos</h3>
            <div className="mt-2 space-x-2">
              <Link to="/" className="text-blue-600 hover:underline">
                Home
              </Link>
              <a
                href="https://app.supabase.com"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline"
              >
                Painel Supabase
              </a>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <MadeWithDyad />
        </div>
      </div>
    </div>
  );
};

export default Index;