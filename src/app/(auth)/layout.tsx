import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
// 👇 Importaciones nuevas necesarias para la seguridad
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

// 👇 Convertimos el componente en 'async' para poder verificar la sesión
export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. EL PORTERO DE SEGURIDAD 👮‍♂️
  // Verificamos si ya hay alguien logueado intentando entrar aquí.
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // 2. SI YA TIENE SESIÓN -> LO MANDAMOS AL DASHBOARD
  // Así evitamos que vea el login/registro si ya está dentro.
  if (session) {
    redirect("/dashboard");
  }

  // 3. SI NO TIENE SESIÓN -> MOSTRAMOS TU DISEÑO ORIGINAL
  return (
    <div className="flex min-h-screen flex-col">
      <Header /> 
      <main className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-background p-4">
        <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}

