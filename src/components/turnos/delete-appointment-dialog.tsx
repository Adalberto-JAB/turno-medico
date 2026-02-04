"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface DeleteAppointmentDialogProps {
  id: string; // ID del turno a borrar
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode; // Elemento que dispara el diálogo (opcional)
}

export function DeleteAppointmentDialog({ 
  id, 
  trigger, 
  onOpenChange, 
  open 
}: DeleteAppointmentDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/turnos/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Error al eliminar");

      toast.success("Turno eliminado correctamente");
      router.refresh(); // Recarga la tabla de fondo
      
      // Si se pasó una función para cerrar el dropdown padre, la llamamos
      if (onOpenChange) onOpenChange(false);
      
    } catch (error) {
      toast.error("No se pudo eliminar el turno");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {/* Si pasamos un trigger (botón), lo usamos. Si no, el padre controla el estado */}
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
      
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Esto eliminará permanentemente el turno de la base de datos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault(); // Evitamos que cierre automático para manejar loading
              handleDelete();
            }}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Eliminando..." : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}