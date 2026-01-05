import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { showSuccess } from "@/utils/toast";

const WelcomeCard: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [visible, setVisible] = React.useState(true);

  if (!user || !visible) return null;

  const handleGoToProfile = () => {
    showSuccess("Abrindo perfil...");
    refreshProfile();
    navigate("/profile", { replace: false });
  };

  const handleGoToDashboard = () => {
    showSuccess("Abrindo painel...");
    navigate("/dashboard", { replace: false });
  };

  return (
    <div className="max-w-3xl mx-auto mt-6">
      <div className="bg-gradient-to-r from-sky-50 to-white border rounded-lg shadow-sm p-5 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-semibold">Bem-vindo de volta</h3>
          <p className="text-sm text-gray-600 mt-1">
            Você está logado como <span className="font-medium">{user.email}</span>
            {profile?.first_name || profile?.last_name ? (
              <span className="text-sm text-gray-700"> — {profile.first_name} {profile.last_name}</span>
            ) : null}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Role: <span className="font-medium">{profile?.role ?? "USER"}</span>
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={handleGoToProfile}
              className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              Ver perfil
            </button>

            <button
              onClick={handleGoToDashboard}
              className="px-3 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 text-sm"
            >
              Ir ao painel
            </button>
          </div>
        </div>

        <div className="mt-4 md:mt-0 md:text-right flex items-start md:items-center gap-3">
          <div className="hidden md:block text-sm text-gray-500">Dica: use o botão 'Ver perfil' para atualizar suas informações.</div>
          <button
            onClick={() => {
              setVisible(false);
              showSuccess("Mensagem dispensada");
            }}
            className="px-2 py-1 text-sm text-gray-500 hover:text-gray-700"
            aria-label="Fechar"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeCard;