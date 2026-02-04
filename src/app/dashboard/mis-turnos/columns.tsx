"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, XCircle } from "lucide-react"; // Usamos XCircle para cancelar
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Reutilizamos el tipo Turno pero sabiendo que user vendrá, aunque no lo mostremos
export type Turno = {
  id: string;
  date: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  notes: string | null;
  doctor: {
    name: string;
    specialty: { name: string };
  };
};

export const columns: ColumnDef<Turno>[] = [
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Fecha y Hora
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("date"));
      return <div className="font-medium">{format(date, "PPP, p 'hs'", { locale: es })}</div>;
    },
  },
  {
    accessorKey: "doctor.name",
    header: "Médico",
    cell: ({ row }) => {
      const doctor = row.original.doctor;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{doctor.name}</span>
          <span className="text-xs text-muted-foreground">
            {doctor.specialty?.name || "General"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
        PENDING: "secondary",
        CONFIRMED: "default",
        COMPLETED: "outline",
        CANCELLED: "destructive",
      };
      
      const labels: Record<string, string> = {
        PENDING: "Pendiente",
        CONFIRMED: "Confirmado",
        COMPLETED: "Completado",
        CANCELLED: "Cancelado",
      };

      return <Badge variant={variants[status]}>{labels[status]}</Badge>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const turno = row.original;
      const router = useRouter();

      // Lógica simple de cancelación para el paciente
      const handleCancel = async () => {
        try {
           const res = await fetch(`/api/turnos/${turno.id}`, {
             method: 'PUT', // Usamos PUT para actualizar estado
             body: JSON.stringify({ status: 'CANCELLED' })
           });
           
           if(res.ok) {
             toast.success("Turno cancelado");
             router.refresh();
           } else {
             toast.error("No se pudo cancelar");
           }
        } catch {
           toast.error("Error de conexión");
        }
      };

      // Solo permitimos cancelar si está Pendiente o Confirmado
      const canCancel = turno.status === 'PENDING' || turno.status === 'CONFIRMED';

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            
            {canCancel ? (
              <DropdownMenuItem onClick={handleCancel} className="text-red-600 cursor-pointer">
                <XCircle className="mr-2 h-4 w-4" />
                Cancelar Turno
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem disabled>
                No hay acciones disponibles
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];