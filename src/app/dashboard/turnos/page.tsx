import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns"; // Importamos las columnas que definimos antes
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

// Forzar que esta página sea dinámica (siempre traiga datos frescos)
export const dynamic = 'force-dynamic';

async function getTurnos() {
  // Obtenemos los turnos incluyendo relaciones y ordenados por fecha
  const turnos = await prisma.appointment.findMany({
    take: 2000, // Limitamos a 100 para no saturar
    orderBy: { date: 'desc' },
    include: {
      doctor: { select: { name: true, specialty: true } },
      user: { select: { name: true, email: true } },
    },
  });

  // Convertimos las fechas a string para evitar errores de serialización de Next.js
  return JSON.parse(JSON.stringify(turnos));
}

export default async function TurnosPage() {
  const data = await getTurnos();

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Gestión de Turnos</h2>
                <p className="text-muted-foreground">
                    Historial completo y administración de citas médicas.
                </p>
            </div>
            <Link href="/dashboard/turnos/crear">
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Nuevo Turno
                </Button>
            </Link>
        </div>

        {/* Tabla de Datos */}
        <DataTable columns={columns} data={data} />
    </div>
  );
}

