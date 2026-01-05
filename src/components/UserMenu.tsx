import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { showError, showSuccess } from "@/utils/toast";
import { User as UserIcon, LogOut, Home } from "lucide-react";

const UserMenu: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const handleSignOut = async () => {
    const res = await signOut();
    // @ts-ignore - supabase response shape may vary
    if (res?.error) {
      showError(res.error.message || "Erro ao sair");
      return;
    }
    showSuccess("Você saiu com sucesso.");
    navigate("/login", { replace: true });
  };

  const displayName =
    profile?.first_name || profile?.last_name || user?.email?.split("@")[0] || "Usuário";
  const initials = (profile?.first_name?.[0] ?? displayName[0] ?? "U").toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((s) => !s)}
        className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-700">
          {profile?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar_url} alt={displayName} className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <span>{initials}</span>
          )}
        </div>
        <div className="hidden md:flex flex-col items-start leading-tight">
          <span className="text-sm font-medium">{displayName}</span>
          <span className="text-xs text-gray-500">{profile?.role ?? "USER"}</span>
        </div>
      </button>

      {open ? (
        <div className="absolute right-0 mt-2 w-44 bg-white border rounded shadow-md z-50">
          <div className="px-3 py-2 border-b">
            <div className="text-sm font-medium truncate">{displayName}</div>
            <div className="text-xs text-gray-500 truncate">{user?.email}</div>
          </div>

          <div className="flex flex-col py-1">
            <Link
              to="/profile"
              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
              onClick={() => setOpen(false)}
            >
              <UserIcon className="w-4 h-4 text-gray-600" />
              <span>Perfil</span>
            </Link>

            <Link
              to="/"
              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
              onClick={() => setOpen(false)}
            >
              <Home className="w-4 h-4 text-gray-600" />
              <span>Painel</span>
            </Link>

            <button
              onClick={() => {
                setOpen(false);
                handleSignOut();
              }}
              className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-gray-50 text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default UserMenu;