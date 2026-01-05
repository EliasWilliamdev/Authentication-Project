import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { showError, showSuccess } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";

const ATTEMPT_KEY = "login_attempts";
const LOCK_KEY = "login_lock_until";
const MAX_ATTEMPTS = 5;
const LOCK_DURATION_MS = 1000 * 60 * 5; // 5 minutes

const Spinner: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={`${className} animate-spin`} viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
  </svg>
);

const formatMs = (ms: number) => {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [lockRemaining, setLockRemaining] = React.useState<number>(0);

  // derive locked state from localStorage value
  const computeLockedUntil = React.useCallback(() => {
    const lockedUntil = parseInt(localStorage.getItem(LOCK_KEY) || "0", 10);
    const remaining = Math.max(0, lockedUntil - Date.now());
    setLockRemaining(remaining);
    return remaining;
  }, []);

  React.useEffect(() => {
    computeLockedUntil();
    const id = setInterval(() => {
      computeLockedUntil();
    }, 1000);
    return () => clearInterval(id);
  }, [computeLockedUntil]);

  const isLocked = lockRemaining > 0;

  const incrementAttempts = () => {
    const attempts = parseInt(localStorage.getItem(ATTEMPT_KEY) || "0", 10) + 1;
    localStorage.setItem(ATTEMPT_KEY, attempts.toString());
    if (attempts >= MAX_ATTEMPTS) {
      localStorage.setItem(LOCK_KEY, (Date.now() + LOCK_DURATION_MS).toString());
      setLockRemaining(LOCK_DURATION_MS);
      showError("Muitas tentativas falhas — sua conta foi temporariamente bloqueada.");
    }
  };

  const resetAttempts = () => {
    localStorage.removeItem(ATTEMPT_KEY);
    localStorage.removeItem(LOCK_KEY);
    setLockRemaining(0);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) {
      showError("Conta bloqueada temporariamente. Aguarde alguns minutos.");
      return;
    }
    if (!email || !password) {
      showError("Preencha e-mail e senha.");
      return;
    }

    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);

    // @ts-ignore
    if (result?.error) {
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

    // If no session was returned but no error, check current session explicitly
    // (useful for cases where confirmation/magic-link took over)
    // NOTE: keep console.debug for developer insights
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      // @ts-ignore
      if (sessionData?.session) {
        resetAttempts();
        showSuccess("Autenticado com sucesso!");
        navigate("/", { replace: true });
        return;
      }
    } catch (err) {
      // Let errors bubble as per project rules; still provide a console debug for devs
      console.debug("getSession threw:", err);
    }

    // Fallback: likely email confirmation required or other flow
    showError(
      "Não foi possível autenticar. Verifique e-mail/senha e confirme sua conta via e-mail se necessário. Você também pode usar o link mágico para entrar sem senha.",
    );
  };

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

    // @ts-ignore
    if (result?.error) {
      incrementAttempts();
      showError(result.error.message || "Falha ao criar conta.");
      return;
    }

    // @ts-ignore
    if (result.data?.session) {
      resetAttempts();
      showSuccess("Conta criada e autenticada com sucesso!");
      navigate("/", { replace: true });
      return;
    }

    // created but no session -> check email confirmation
    // @ts-ignore
    if (result.data?.user && !result.data?.session) {
      showSuccess("Conta criada. Verifique seu e-mail para confirmar a conta antes de fazer login.");
      return;
    }

    showSuccess("Conta criada. Verifique seu e-mail para confirmar (se aplicável).");
  };

  const handleSendMagicLink = async () => {
    if (!email) {
      showError("Forneça um e-mail para receber o link mágico.");
      return;
    }
    setLoading(true);
    const result = await supabase.auth.signInWithOtp({ email });
    setLoading(false);

    // @ts-ignore
    if (result?.error) {
      showError(result.error.message || "Falha ao enviar o link mágico.");
      return;
    }

    showSuccess("Link mágico enviado — verifique seu e-mail para acessar a conta.");
  };

  const handleResetPassword = async () => {
    if (!email) {
      showError("Forneça seu e-mail para receber instruções de recuperação.");
      return;
    }
    setLoading(true);
    const res = await supabase.auth.resetPasswordForEmail(email);
    setLoading(false);
    // @ts-ignore
    if (res?.error) {
      showError(res.error.message || "Falha ao enviar instruções de recuperação.");
      return;
    }
    showSuccess("E-mail de recuperação enviado. Verifique sua caixa de entrada.");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b">
            <h2 className="text-xl font-semibold text-sky-600">Entrar na Minha Aplicação</h2>
            <p className="text-sm text-gray-500 mt-1">
              Faça login com e-mail e senha, ou receba um link mágico por e-mail.
            </p>
          </div>

          <form onSubmit={handleSignIn} className="px-6 py-6 space-y-4">
            {isLocked ? (
              <div className="rounded-md bg-red-50 border border-red-100 p-3 text-sm text-red-700">
                Conta bloqueada temporariamente por muitas tentativas. Tente novamente em{" "}
                <strong>{formatMs(lockRemaining)}</strong>.
              </div>
            ) : null}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-sky-200"
                placeholder="seu@exemplo.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full px-3 py-2 border rounded pr-10 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500 px-2 py-1 rounded hover:bg-gray-100"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>
              <div className="flex items-center justify-between mt-2">
                <button
                  type="button"
                  onClick={handleResetPassword}
                  disabled={loading}
                  className="text-sm text-gray-600 hover:underline disabled:opacity-60"
                >
                  Esqueci minha senha
                </button>

                <div className="text-sm text-gray-500">
                  Tentativas:{" "}
                  <strong>{localStorage.getItem(ATTEMPT_KEY) || "0"}/{MAX_ATTEMPTS}</strong>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={loading || isLocked}
                className="flex items-center justify-center gap-2 flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
                aria-live="polite"
              >
                {loading ? <Spinner className="w-4 h-4 text-white" /> : null}
                <span>{loading ? "Entrando..." : "Entrar"}</span>
              </button>

              <button
                type="button"
                onClick={handleSignUp}
                disabled={loading || isLocked}
                className="px-3 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 disabled:opacity-60 text-sm"
              >
                Criar conta
              </button>
            </div>

            <div className="pt-2 border-t">
              <div className="flex items-center justify-between mt-3">
                <button
                  type="button"
                  onClick={handleSendMagicLink}
                  disabled={loading}
                  className="text-sm text-sky-600 hover:underline disabled:opacity-60"
                >
                  Enviar link mágico (entrar sem senha)
                </button>

                <a
                  href="/auth/callback"
                  className="text-sm text-gray-500 hover:underline"
                  onClick={(e) => e.preventDefault()}
                >
                  Já recebeu o link? Abra-o no seu e-mail para completar o login.
                </a>
              </div>

              <p className="text-xs text-gray-400 mt-3">
                Observação: após criar conta, verifique sua caixa de entrada — pode ser necessário confirmar o e-mail.
              </p>
            </div>
          </form>
        </div>

        <div className="text-center mt-4 text-sm text-gray-500">
          <p>
            Precisa de ajuda? Abra um chamado ou confira a documentação do sistema.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;