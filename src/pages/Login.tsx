import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { showError, showSuccess } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";

const ATTEMPT_KEY = "login_attempts";
const LOCK_KEY = "login_lock_until";
const MAX_ATTEMPTS = 5;
const LOCK_DURATION_MS = 1000 * 60 * 5; // 5 minutes

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const lockedUntil = parseInt(localStorage.getItem(LOCK_KEY) || "0", 10);
  const isLocked = Date.now() < lockedUntil;

  const incrementAttempts = () => {
    const attempts = parseInt(localStorage.getItem(ATTEMPT_KEY) || "0", 10) + 1;
    localStorage.setItem(ATTEMPT_KEY, attempts.toString());
    if (attempts >= MAX_ATTEMPTS) {
      localStorage.setItem(LOCK_KEY, (Date.now() + LOCK_DURATION_MS).toString());
      showError("Muitas tentativas falhas — tente novamente mais tarde.");
    }
  };

  const resetAttempts = () => {
    localStorage.removeItem(ATTEMPT_KEY);
    localStorage.removeItem(LOCK_KEY);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) {
      showError("Conta bloqueada temporariamente. Aguarde alguns minutos.");
      return;
    }
    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);

    // Debugging info for developer
    // @ts-ignore
    console.debug("signIn result:", result);

    // Supabase v2 returns result.error when there's an auth error
    // @ts-ignore
    if (result.error) {
      incrementAttempts();
      showError(result.error.message || "Falha ao autenticar.");
      return;
    }

    // @ts-ignore
    if (result.data?.session) {
      resetAttempts();
      showSuccess("Autenticado com sucesso!");
      navigate("/", { replace: true });
      return;
    }

    // If there's no session and no explicit error, show helpful message
    showError(
      "Não foi possível autenticar. Verifique seu e-mail/senha e se a conta foi confirmada via e-mail.",
    );
  };

  // Use a separate handler for creating account (triggered by button click)
  const handleSignUp = async () => {
    if (isLocked) {
      showError("Conta bloqueada temporariamente. Aguarde alguns minutos.");
      return;
    }

    if (!email || !password) {
      showError("Preencha email e senha para criar a conta.");
      return;
    }

    setLoading(true);
    const result = await signUp(email, password);
    setLoading(false);

    // Debugging info for developer
    // @ts-ignore
    console.debug("signUp result:", result);

    // @ts-ignore
    if (result.error) {
      incrementAttempts();
      showError(result.error.message || "Falha ao criar conta.");
      return;
    }

    // If signUp returned a session, user is already signed in
    // @ts-ignore
    if (result.data?.session) {
      resetAttempts();
      showSuccess("Conta criada e autenticada com sucesso!");
      navigate("/", { replace: true });
      return;
    }

    // If signUp created the user but didn't return a session, it's likely
    // because email confirmation is required (magic link / confirmation email).
    // Inform the user to check their email instead of trying to sign in immediately.
    // @ts-ignore
    if (result.data?.user && !result.data?.session) {
      showSuccess(
        "Conta criada. Verifique seu e-mail para confirmar a conta antes de fazer login. Você também pode usar o link mágico abaixo para acessar a conta.",
      );
      return;
    }

    // Fallback
    showSuccess("Conta criada. Verifique seu e-mail para confirmar (se aplicável).");
  };

  // Send magic link to email to allow login (useful if confirmation blocks sign-in)
  const handleSendMagicLink = async () => {
    if (!email) {
      showError("Forneça um e-mail para receber o link mágico.");
      return;
    }
    setLoading(true);
    const result = await supabase.auth.signInWithOtp({ email });
    setLoading(false);

    // @ts-ignore
    console.debug("signInWithOtp result:", result);

    // @ts-ignore
    if (result.error) {
      showError(result.error.message || "Falha ao enviar o link mágico.");
      return;
    }

    showSuccess("Link mágico enviado — verifique seu e-mail para acessar a conta.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 text-center">Entrar</h2>
        {isLocked && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">
            Conta bloqueada temporariamente por muitas tentativas. Tente novamente mais tarde.
          </div>
        )}
        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={loading || isLocked}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>

            <button
              onClick={handleSignUp}
              type="button"
              disabled={loading}
              className="px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
            >
              Criar conta
            </button>
          </div>

          <div className="mt-2 flex justify-center">
            <button
              onClick={handleSendMagicLink}
              type="button"
              disabled={loading || !email}
              className="px-3 py-2 text-sm text-blue-600 hover:underline disabled:opacity-60"
            >
              Enviar link mágico (entrar sem senha)
            </button>
          </div>
        </form>

        <p className="text-sm text-gray-500 mt-4">
          Ao criar conta, um perfil será criado automaticamente (role padrão: USER).
        </p>
      </div>
    </div>
  );
};

export default Login;