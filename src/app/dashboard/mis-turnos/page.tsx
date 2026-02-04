import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth"; // Instancia server de Better Auth
import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = 'force-dynamic';

export default async function MisTurnosPage() {
  // 1. Obtener sesión del servidor de forma segura
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect("/login");
  }

  // 2. Buscar SOLO los turnos de este usuario
  const misTurnos = await prisma.appointment.findMany({
    where: {
      userId: session.user.id, // 👈 EL FILTRO CLAVE
    },
    orderBy: { date: 'desc' },
    include: {
      doctor: {
        include: { specialty: true }
      }
      // No incluimos 'user' porque ya sabemos quién es
    }
  });

  // Serialización simple para pasar props (por las fechas)
  const data = JSON.parse(JSON.stringify(misTurnos));

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="px-0">
          <CardTitle className="text-3xl font-bold">Mis Turnos</CardTitle>
          <CardDescription>
            Historial y próximas citas médicas agendadas.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <DataTable columns={columns} data={data} />
        </CardContent>
      </Card>
    </div>
  );
}