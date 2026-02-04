"use client";

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
import { PatientActions } from "@/components/pacientes/patient-actions";

export type Patient = {
  id: string;
  name: string;
  email: string;
  _count?: {
    appointments: number;
  };
};

export const columns: ColumnDef<Patient>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nombre
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "_count.appointments",
    header: "Turnos",
    cell: ({ row }) => {
      const count = row.original._count?.appointments || 0;
      return <Badge variant="secondary">{count} Registrados</Badge>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      // 👇 Delegamos toda la lógica al componente PatientActions
      return <PatientActions patient={row.original} />;
    },
  },
];

