import { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

// ✅ SEO habilitado
export const metadata: Metadata = {
  title: "Crear Cuenta | MedTurnos",
  description: "Regístrate en la plataforma para gestionar tus consultas médicas.",
};

export default function RegisterPage() {
  // 🟢 Server Component
  return (
    <div className="flex justify-center items-center w-full">
      <RegisterForm />
    </div>
  );
}