import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import ProfileForm from "@/components/ProfileForm";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import ProfileSummary from "@/components/ProfileSummary";

const ProfilePageContent: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    // should not happen because this component is wrapped by ProtectedRoute,
    // but keep a guard to avoid rendering flashes.
    navigate("/login", { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <ProfileSummary />

        <h1 className="text-2xl font-semibold mb-4">Seu Perfil</h1>
        <p className="text-sm text-gray-600 mb-6">
          Atualize seu nome, sobrenome e avatar. As alterações serão salvas no seu perfil.
        </p>

        <ProfileForm />
      </main>
    </div>
  );
};

const ProfilePage: React.FC = () => {
  return (
    <ProtectedRoute>
      <ProfilePageContent />
    </ProtectedRoute>
  );
};

export default ProfilePage;