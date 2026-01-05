import React from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;

    const handle = async () => {
      try {
        // Parse session from the URL (magic link / redirect) and store it in the client
        // storeSession: true ensures the session is saved in local storage/cookie
        // This API may return an error when the URL doesn't contain auth params.
        // @ts-ignore
        const { data, error } = await supabase.auth.getSessionFromUrl({ storeSession: true });

        if (!mounted) return;

        if (error) {
          console.debug("getSessionFromUrl error:", error);
          showError(error.message || "Falha ao processar o link de autenticação.");
          navigate("/login", { replace: true });
          return;
        }

        // @ts-ignore
        if (data?.session) {
          showSuccess("Autenticado com sucesso!");
          navigate("/", { replace: true });
          return;
        }

        // If no session found, redirect to login with a message
        showError("Não foi possível autenticar com o link. Tente entrar novamente.");
        navigate("/login", { replace: true });
      } catch (err) {
        console.debug("getSessionFromUrl threw:", err);
        showError("Erro ao processar o link de autenticação.");
        navigate("/login", { replace: true });
      } finally {
        if (mounted) setLoading(false);
      }
    };

    handle();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <div className="text-lg font-medium mb-2">Processando link de autenticação…</div>
            <div className="text-sm text-gray-600">Aguarde enquanto finalizamos seu login.</div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthCallback;