import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth"; // Importa tu instancia de auth del servidor

export default async function MedicosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verificamos sesión en el servidor (Rápido y seguro)
  const session = await auth.api.getSession({
    headers: await headers()
  });

  // Si no es ADMIN, expulsado
  if (session?.user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return <>{children}</>;
}