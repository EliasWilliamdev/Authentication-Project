import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { showSuccess, showError } from "@/utils/toast";

const ProfileForm: React.FC = () => {
  const { profile, updateProfile, refreshProfile } = useAuth();

  const [firstName, setFirstName] = React.useState(profile?.first_name ?? "");
  const [lastName, setLastName] = React.useState(profile?.last_name ?? "");
  const [avatarUrl, setAvatarUrl] = React.useState(profile?.avatar_url ?? "");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    setFirstName(profile?.first_name ?? "");
    setLastName(profile?.last_name ?? "");
    setAvatarUrl(profile?.avatar_url ?? "");
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload: Partial<typeof profile> = {
      first_name: firstName || null,
      last_name: lastName || null,
      avatar_url: avatarUrl || null,
    };

    const res = await updateProfile(payload);
    setLoading(false);

    // supabase response shape: { data, error }
    // @ts-ignore
    if (res?.error) {
      // @ts-ignore
      showError(res.error.message || "Falha ao atualizar perfil.");
      return;
    }

    showSuccess("Perfil atualizado com sucesso.");
    // refresh local profile state
    await refreshProfile();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-lg shadow p-6">
      <div className="flex items-center space-x-4">
        <div>
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="Avatar" className="w-20 h-20 rounded-full object-cover border" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 border">
              <span>Avatar</span>
            </div>
          )}
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">Avatar URL</label>
          <input
            type="url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://..."
            className="w-full mt-1 px-3 py-2 border rounded"
          />
          <p className="text-xs text-gray-500 mt-1">URL pública da imagem de avatar (opcional).</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Nome</label>
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="w-full mt-1 px-3 py-2 border rounded"
          placeholder="Primeiro nome"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Sobrenome</label>
        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="w-full mt-1 px-3 py-2 border rounded"
          placeholder="Sobrenome"
        />
      </div>

      <div className="flex items-center justify-end space-x-2">
        <button
          type="button"
          onClick={async () => {
            // revert to current profile values
            setFirstName(profile?.first_name ?? "");
            setLastName(profile?.last_name ?? "");
            setAvatarUrl(profile?.avatar_url ?? "");
            showSuccess("Alterações revertidas.");
          }}
          className="px-3 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 text-sm"
        >
          Reverter
        </button>

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60 text-sm"
        >
          {loading ? "Salvando..." : "Salvar perfil"}
        </button>
      </div>
    </form>
  );
};

export default ProfileForm;