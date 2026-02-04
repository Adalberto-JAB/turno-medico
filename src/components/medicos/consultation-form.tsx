"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { saveMedicalRecord } from "@/actions/clinical-history";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Props {
  appointmentId: string;
}

export function ConsultationForm({ appointmentId }: Props) {
  const [loading, setLoading] = useState(false);

  // Manejamos el envío manualmente para capturar errores
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); // Evitamos recarga standard
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    
    // Llamamos a la Server Action
    const result = await saveMedicalRecord(formData);

    // Si hay error, lo mostramos y detenemos la carga
    if (result?.error) {
      toast.error(result.error);
      setLoading(false);
    } 
    // Si NO hay error, la Server Action hace el redirect automáticamente,
    // así que no necesitamos hacer nada más aquí.
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input type="hidden" name="appointmentId" value={appointmentId} />

      <div className="space-y-2">
        <Label htmlFor="diagnosis" className="text-base font-semibold">
          Diagnóstico Principal *
        </Label>
        <Input
          id="diagnosis"
          name="diagnosis"
          placeholder="Ej: Gripe estacional, Hipertensión..."
          required
          className="text-lg"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="treatment" className="font-semibold">
          Plan de Tratamiento / Receta
        </Label>
        <Textarea
          id="treatment"
          name="treatment"
          placeholder="Ej: Ibuprofeno 400mg cada 8hs por 3 días..."
          className="min-h-25"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes" className="font-semibold text-muted-foreground">
          Notas Privadas (Opcional)
        </Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Observaciones internas solo visibles para médicos..."
          className="min-h-20 bg-slate-50"
        />
      </div>

      <div className="pt-4 flex justify-end">
        <Button type="submit" size="lg" className="w-full md:w-auto" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Guardar Historia y Finalizar
        </Button>
      </div>
    </form>
  );
}