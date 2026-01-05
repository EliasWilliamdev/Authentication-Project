import React from "react";
import Header from "@/components/Header";
import ProfileForm from "@/components/ProfileForm";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";

const ProfileEditContent: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    // Guard adicional; o ProtectedRoute deve prevenir este caso, mas mantemos a checagem.
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-6">Editar Perfil</h1>
        <p className="text-sm text-gray-600 mb-6">
          Atualize seu e-mail, nome, sobrenome e avatar. Mudanças no e-mail podem exigir confirmação por e-mail.
        </p>

        <ProfileForm />
      </main>
    </div>
  );
};

const ProfileEditPage: React.FC = () => {
  return (
    <ProtectedRoute>
      <ProfileEditContent />
    </ProtectedRoute>
  );
};

export default ProfileEditPage;