import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { User as UserIcon } from "lucide-react";
import { Link } from "react-router-dom";

const ProfileSummary: React.FC = () => {
  const { user, profile } = useAuth();

  if (!user) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="text-sm text-gray-600">Nenhum usuário autenticado.</div>
      </div>
    );
  }

  const displayName =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
    user.email?.split("@")[0] ||
    "Usuário";
  const initials = (profile?.first_name?.[0] ?? displayName[0] ?? "U").toUpperCase();

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6 flex items-center gap-6">
      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-2xl font-semibold text-gray-700 overflow-hidden border">
        {profile?.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{displayName}</h2>
            <div className="text-sm text-gray-500">{user.email}</div>
            <div className="text-sm text-gray-500 mt-1">Role: <span className="font-medium">{profile?.role ?? "USER"}</span></div>
          </div>

          <div className="hidden sm:block">
            <Link
              to="#profile-form"
              className="px-3 py-2 bg-sky-600 text-white rounded hover:bg-sky-700 text-sm"
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById("profile-form");
                if (el) {
                  el.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }}
            >
              Editar perfil
            </Link>
          </div>
        </div>

        <div className="mt-3 text-sm text-gray-600">
          Atualizado em: <span className="font-medium">{profile?.updated_at ?? "—"}</span>
        </div>
      </div>
    </div>
  );
};

export default ProfileSummary;