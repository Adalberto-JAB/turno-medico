import { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form"; // Importamos el componente cliente

// ✅ VENTAJA: Ahora podemos exportar Metadata para SEO
export const metadata: Metadata = {
  title: "Iniciar Sesión | MedTurnos",
  description: "Accede a tu cuenta para gestionar turnos médicos.",
};

export default function LoginPage() {
  // Este componente se renderiza en el servidor.
  // No tiene lógica, solo devuelve el HTML estático inicial y "hidrata" el formulario dentro.
  return (
    <div className="flex justify-center items-center w-full">
      <LoginForm />
    </div>
  );
}