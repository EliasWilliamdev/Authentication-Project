import React from "react";
import Header from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import ProfileSummary from "@/components/ProfileSummary";
import { showSuccess } from "@/utils/toast";
import { Link } from "react-router-dom";

const StatCard: React.FC<{ title: string; value: string | number; helper?: string }> = ({
  title,
  value,
  helper,
}) => (
  <div className="bg-white rounded-lg shadow p-4">
    <div className="text-sm text-gray-500">{title}</div>
    <div className="text-2xl font-semibold mt-2">{value}</div>
    {helper ? <div className="text-xs text-gray-400 mt-1">{helper}</div> : null}
  </div>
);

const Dashboard: React.FC = () => {
  const { user, profile } = useAuth();

  React.useEffect(() => {
    if (user && !localStorage.getItem("dashboard_welcomed")) {
      showSuccess(`Olá ${user.email}, este é o seu painel.`);
      localStorage.setItem("dashboard_welcomed", "1");
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Painel</h1>
            <p className="text-sm text-gray-600 mt-1">Visão geral da sua conta e atividade recente.</p>
          </div>

          <div className="flex gap-2 items-center">
            <Link
              to="/profile/edit"
              className="px-3 py-2 bg-sky-600 text-white rounded hover:bg-sky-700 text-sm"
            >
              Editar perfil
            </Link>

            <button
              onClick={() => showSuccess("Atualizando dados...")}
              className="px-3 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 text-sm"
            >
              Atualizar dados
            </button>
          </div>
        </div>

        <section className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Usuários conectados" value={profile?.role ?? "USER"} helper="Sua role atual" />
          <StatCard title="E-mail" value={user?.email ?? "—"} helper="Seu e-mail cadastrado" />
          <StatCard title="Última atualização" value={profile?.updated_at ?? "—"} helper="Quando o perfil foi alterado" />
        </section>

        <section className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium">Atividade recente</h2>
              <p className="text-sm text-gray-500 mt-2">Aqui aparecerão eventos recentes relacionados à sua conta.</p>

              <ul className="mt-4 space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-sky-500 mt-2" />
                  <div>
                    <div className="text-sm font-medium">Login efetuado</div>
                    <div className="text-xs text-gray-500">Você entrou no sistema recentemente.</div>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gray-400 mt-2" />
                  <div>
                    <div className="text-sm font-medium">Perfil atualizado</div>
                    <div className="text-xs text-gray-500">Última alteração de perfil (se houver).</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <aside>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm text-gray-600">Links rápidos</h3>
              <div className="mt-3 flex flex-col gap-2">
                <Link to="/profile/edit" className="text-sky-600 hover:underline text-sm">Editar perfil</Link>
                <a href="https://app.supabase.com" target="_blank" rel="noreferrer" className="text-sky-600 hover:underline text-sm">Painel Supabase</a>
                <button
                  onClick={() => showSuccess("Ação rápida executada")}
                  className="text-sm text-gray-700 text-left"
                >
                  Executar ação rápida
                </button>
              </div>
            </div>

            <div className="mt-4">
              <ProfileSummary />
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;