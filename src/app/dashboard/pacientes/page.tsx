import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function PacientesPage() {
  const data = await prisma.user.findMany({
    where: { role: 'PATIENT' },
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { appointments: true }
      }
    }
  });

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Pacientes</h2>
                <p className="text-muted-foreground">
                    Gestión de usuarios registrados en el sistema.
                </p>
            </div>
            <Link href="/dashboard/pacientes/crear">
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Nuevo Paciente
                </Button>
            </Link>
        </div>

        <DataTable columns={columns} data={data} />
    </div>
  );
}

