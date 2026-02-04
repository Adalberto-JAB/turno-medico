"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Esquema actualizado: specialtyId es lo que guardamos
const formSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  licenseNumber: z.string().min(1, "La matrícula es obligatoria"),
  specialtyId: z.string().min(1, "Selecciona una especialidad"),
});

// Props actualizadas: Recibimos las especialidades de la DB
type Props = {
  initialData?: {
    id: string;
    name: string;
    specialtyId: string;
    licenseNumber: string | null;
  } | null;
  specialties: { id: string; name: string }[]; // 👈 Nueva prop
};

export function DoctorForm({ initialData, specialties }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      licenseNumber: initialData?.licenseNumber || "",
      specialtyId: initialData?.specialtyId || "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      // Nota: Aquí seguirás usando tu API Route o podrías cambiarlo a Server Action también.
      // Para no romper todo junto, dejemos el fetch a la API pero actualizando el campo specialty -> specialtyId
      const url = initialData ? `/api/medicos/${initialData.id}` : "/api/medicos";
      const method = initialData ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
             name: values.name,
             licenseNumber: values.licenseNumber,
             specialtyId: values.specialtyId // 👈 Enviamos el ID
        }),
      });

      if (!response.ok) throw new Error("Error al guardar");

      toast.success(initialData ? "Médico actualizado" : "Médico creado correctamente");
      router.push("/dashboard/medicos");
      router.refresh();
    } catch (error) {
      toast.error("Hubo un error al guardar los datos");
    } finally {
      setLoading(false);
    }
  }

  const buttonText = initialData ? "Guardar Cambios" : "Registrar Médico";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre y Apellido</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Dr. Juan Pérez" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="licenseNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nro. de Matrícula</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: 54321" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* ESPECIALIDAD (Ahora dinámica) */}
        <FormField
          control={form.control}
          name="specialtyId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Especialidad</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una especialidad" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {specialties.map((spec) => (
                    <SelectItem key={spec.id} value={spec.id}>
                      {spec.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full md:w-auto" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {buttonText}
        </Button>
      </form>
    </Form>
  );
}