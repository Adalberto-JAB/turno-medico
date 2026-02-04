"use client";

import { useState } from "react"; // Importar useState
import Link from "next/link"; // Importar Link
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal, Pencil, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { DeleteDoctorDialog } from "@/components/medicos/delete-doctor-dialog"; // Importar el Dialog

export type Doctor = {
  id: string;
  name: string;
  specialty: { name: string };
  licenseNumber: string | null;
  _count?: {
    appointments: number; // Para mostrar cuántos turnos tiene (opcional)
  }
};

export const columns: ColumnDef<Doctor>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Profesional
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "specialty",
    header: "Especialidad",
    cell: ({ row }) => <Badge variant="secondary">{row.original.specialty.name}</Badge>,
  },
  {
    accessorKey: "licenseNumber",
    header: "Matrícula",
    cell: ({ row }) => row.getValue("licenseNumber") || "-",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const doctor = row.original;
      // eslint-disable-next-line
      const [showDeleteDialog, setShowDeleteDialog] = useState(false);
      return (
        <>
          <DeleteDoctorDialog 
            id={doctor.id} 
            open={showDeleteDialog} 
            onOpenChange={setShowDeleteDialog} 
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            {/* 
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(doctor.id)}>
                Copiar ID
              </DropdownMenuItem>
              <DropdownMenuItem className="text-muted-foreground cursor-not-allowed">
                <Pencil className="mr-2 h-4 w-4" /> Editar (Pronto)
              </DropdownMenuItem>
            </DropdownMenuContent>
            */}

            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(doctor.id)}>
                Copiar ID
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/medicos/${doctor.id}`} className="cursor-pointer flex items-center">
                   <Pencil className="mr-2 h-4 w-4" /> Editar
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem 
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-600 cursor-pointer"
              >
                 <Trash className="mr-2 h-4 w-4" /> Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>

          </DropdownMenu>
        </>
      );
    },
  },
];

