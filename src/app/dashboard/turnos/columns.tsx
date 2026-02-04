"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ArrowUpDown, 
  MoreHorizontal, 
  CheckCircle2, // Icono para confirmar
  XCircle,      // Icono para cancelar
  CheckSquare   // Icono para completar
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Appointment, User, Doctor, Specialty } from "@/generated/prisma/client";

// Definimos el tipo combinando los modelos de Prisma necesarios
type TurnoCompleto = Appointment & {
  user: { name: string; email: string };
  doctor: Doctor & { specialty: Specialty };
};

export const columns: ColumnDef<TurnoCompleto>[] = [
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
    accessorKey: "user.name",
    header: "Paciente",
    cell: ({ row }) => <div className="capitalize">{row.original.user.name}</div>,
  },
  {
    accessorKey: "doctor.name",
    header: "Médico",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.doctor.name}</span>
        <span className="text-xs text-muted-foreground">{row.original.doctor.specialty.name}</span>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
        PENDING: "secondary",    // Gris/Azul claro
        CONFIRMED: "default",    // Negro/Blanco (Fuerte)
        COMPLETED: "outline",    // Borde simple
        CANCELLED: "destructive", // Rojo
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

      // Función para cambiar estados
      const updateStatus = async (newStatus: string) => {
        try {
           const res = await fetch(`/api/turnos/${turno.id}`, {
             method: 'PUT',
             body: JSON.stringify({ status: newStatus })
           });
           
           if(res.ok) {
             toast.success(`Turno actualizado a: ${newStatus}`);
             router.refresh();
           } else {
             toast.error("No se pudo actualizar");
           }
        } catch {
           toast.error("Error de conexión");
        }
      };

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
            
            {/* Solo mostramos CONFIRMAR si está Pendiente */}
            {turno.status === 'PENDING' && (
              <DropdownMenuItem onClick={() => updateStatus('CONFIRMED')} className="text-green-600 cursor-pointer">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Confirmar Turno
              </DropdownMenuItem>
            )}

            {/* Solo mostramos COMPLETAR si ya está confirmado (para cuando el paciente vino) */}
            {turno.status === 'CONFIRMED' && (
              <DropdownMenuItem onClick={() => updateStatus('COMPLETED')} className="cursor-pointer">
                <CheckSquare className="mr-2 h-4 w-4" />
                Marcar como Atendido
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            {/* Siempre se puede cancelar salvo que ya esté cancelado/completado */}
            {(turno.status === 'PENDING' || turno.status === 'CONFIRMED') && (
              <DropdownMenuItem onClick={() => updateStatus('CANCELLED')} className="text-red-600 cursor-pointer">
                <XCircle className="mr-2 h-4 w-4" />
                Cancelar Turno
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

