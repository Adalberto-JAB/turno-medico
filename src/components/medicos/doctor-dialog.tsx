"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Pencil } from "lucide-react";
import { createOrUpdateDoctor } from "@/actions/admin-doctors";
import { toast } from "sonner";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";

interface Specialty {
  id: string;
  name: string;
}

// Tipado para el médico que vamos a editar
interface DoctorData {
  id: string;
  name: string;
  licenseNumber: string | null;
  specialtyId: string;
  user?: { email: string } | null;
}

interface Props {
  specialties: Specialty[];
  doctorToEdit?: DoctorData; // 👈 Opcional: Si viene, es edición
}

export function DoctorDialog({ specialties, doctorToEdit }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const isEditing = !!doctorToEdit;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    
    const result = await createOrUpdateDoctor(null, formData);
    
    setLoading(false);
    if (result.success) {
      toast.success(result.message);
      setOpen(false);
    } else {
      toast.error(result.message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEditing ? (
          <Button variant="ghost" size="sm">
            <Pencil className="h-4 w-4 mr-2" /> 
          </Button>
        ) : (
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Nuevo Médico
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Médico" : "Agregar Médico"}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Modifica los datos o vincula un usuario existente." 
              : "Crea una ficha médica nueva."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          
          {/* ID OCULTO PARA EDICIÓN */}
          {isEditing && <input type="hidden" name="id" value={doctorToEdit.id} />}

          {/* NOMBRE */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Nombre</Label>
            <Input 
              id="name" 
              name="name" 
              defaultValue={doctorToEdit?.name} 
              className="col-span-3" 
              required 
            />
          </div>

          {/* ESPECIALIDAD */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="specialty" className="text-right">Espec.</Label>
            <div className="col-span-3">
              <Select name="specialtyId" defaultValue={doctorToEdit?.specialtyId || ""} required>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {specialties.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* MATRÍCULA */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="license" className="text-right">Matrícula</Label>
            <Input 
              id="license" 
              name="licenseNumber" 
              defaultValue={doctorToEdit?.licenseNumber || ""} 
              className="col-span-3" 
            />
          </div>

          {/* VINCULACIÓN */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">Email</Label>
            <Input 
              id="email" 
              name="email" 
              type="email" 
              defaultValue={doctorToEdit?.user?.email || ""} 
              placeholder="usuario@sistema.com" 
              className="col-span-3" 
            />
          </div>
          <p className="text-xs text-muted-foreground text-right pl-12">
            Ingresa el email del usuario registrado para darle acceso.
          </p>

          <div className="flex justify-end mt-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}