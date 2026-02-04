"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { es } from "date-fns/locale";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { Textarea } from "@/components/ui/textarea";

// Importamos el componente visual y la acción de disponibilidad (esa sí puede ser server action o fetch según prefieras)
import { TimeSlots } from "./time-slots";
import { getAvailableSlots } from "@/actions/availability";

const formSchema = z.object({
  userId: z.string().min(1, "Selecciona un paciente"),
  doctorId: z.string().min(1, "Selecciona un médico"),
  date: z.date({ message: "La fecha es obligatoria" }),
  time: z.string().min(1, "Debes seleccionar un horario"),
  notes: z.string().optional(),
});

type Props = {
  patients: { id: string; name: string }[];
  doctors: { id: string; name: string; specialty?: { name: string } }[];
  currentUser?: { id: string; role?: string | null; name?: string } | null;
};

export function AppointmentForm({ patients, doctors, currentUser }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Estados UI
  const [openPatient, setOpenPatient] = useState(false);
  const [openDoctor, setOpenDoctor] = useState(false);

  // Estados Disponibilidad
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotError, setSlotError] = useState<string | null>(null);

  const isPatient = currentUser?.role === "PATIENT";

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: isPatient && currentUser?.id ? currentUser.id : "",
      doctorId: "",
      notes: "",
      time: "", 
    },
  });

  const selectedDate = form.watch("date");
  const selectedDoctorId = form.watch("doctorId");

  // Efecto para buscar slots disponibles
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedDate || !selectedDoctorId) {
        setAvailableSlots([]);
        return;
      }

      setLoadingSlots(true);
      setSlotError(null);
      form.setValue("time", ""); 

      try {
        const dateStr = selectedDate.toISOString();
        const response = await getAvailableSlots(selectedDoctorId, dateStr);

        if (response.error) {
          setSlotError(response.error);
          setAvailableSlots([]);
        } else {
          setAvailableSlots(response.slots);
        }
      } catch (error) {
        setSlotError("Error buscando horarios");
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedDate, selectedDoctorId, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      // 1. Construimos la fecha completa combinando Día + Hora seleccionada
      const finalDate = new Date(values.date);
      const [hours, minutes] = values.time.split(":");
      finalDate.setHours(parseInt(hours), parseInt(minutes));

      // 2. PETICIÓN A LA API (Requisito del TP) 📡
      const response = await fetch("/api/turnos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: values.userId,
          doctorId: values.doctorId,
          date: finalDate.toISOString(),
          notes: values.notes,
        }),
      });

      // 3. Manejo de respuesta
      if (!response.ok) {
        // Intentamos leer el error del backend
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Error al crear el turno");
      }

      toast.success("¡Turno reservado con éxito!");
      
      // Redirección
      router.refresh(); // Refresca los datos del servidor
      if (isPatient) {
        router.push("/dashboard/mis-turnos");
      } else {
        router.push("/dashboard/turnos");
      }
      
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* PACIENTE */}
          {isPatient ? (
             <FormItem>
               <FormLabel>Paciente</FormLabel>
               <div className="p-3 border rounded-md bg-slate-50 dark:bg-slate-900 text-sm font-medium">
                  {currentUser?.name}
               </div>
               <input type="hidden" {...form.register("userId")} />
            </FormItem>
          ) : (
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Paciente</FormLabel>
                  <Popover open={openPatient} onOpenChange={setOpenPatient}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                        >
                          {field.value
                            ? patients.find((p) => p.id === field.value)?.name
                            : "Seleccionar paciente..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-75 p-0">
                      <Command>
                        <CommandInput placeholder="Buscar paciente..." />
                        <CommandList>
                          <CommandEmpty>No encontrado.</CommandEmpty>
                          <CommandGroup>
                            {patients.map((patient) => (
                              <CommandItem
                                value={patient.name}
                                key={patient.id}
                                onSelect={() => {
                                  form.setValue("userId", patient.id);
                                  setOpenPatient(false);
                                }}
                              >
                                <Check
                                  className={cn("mr-2 h-4 w-4", patient.id === field.value ? "opacity-100" : "opacity-0")}
                                />
                                {patient.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* MÉDICO */}
          <FormField
            control={form.control}
            name="doctorId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Especialista</FormLabel>
                <Popover open={openDoctor} onOpenChange={setOpenDoctor}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                      >
                        {field.value
                          ? doctors.find((d) => d.id === field.value)?.name
                          : "Seleccionar médico..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-75 p-0">
                    <Command>
                      <CommandInput placeholder="Buscar..." />
                      <CommandList>
                        <CommandEmpty>No encontrado.</CommandEmpty>
                        <CommandGroup>
                          {doctors.map((doctor) => (
                            <CommandItem
                              value={doctor.name}
                              key={doctor.id}
                              onSelect={() => {
                                form.setValue("doctorId", doctor.id);
                                setOpenDoctor(false);
                              }}
                            >
                              <Check
                                className={cn("mr-2 h-4 w-4", doctor.id === field.value ? "opacity-100" : "opacity-0")}
                              />
                              <div className="flex flex-col">
                                <span className="font-medium">{doctor.name}</span>
                                <span className="text-xs text-muted-foreground">{doctor.specialty?.name}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* FECHA */}
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha</FormLabel>
                <div className="border rounded-md p-3 bg-card">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0,0,0,0);
                      return date < today; 
                    }}
                    initialFocus
                    locale={es}
                    className="mx-auto"
                  />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* HORARIOS */}
          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem className="flex flex-col h-full">
                <FormLabel>Horario</FormLabel>
                <div className="flex-1 border rounded-md p-4 bg-slate-50 dark:bg-slate-900/50">
                  {!selectedDate ? (
                    <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                      👈 Selecciona una fecha
                    </div>
                  ) : (
                    <TimeSlots 
                      slots={availableSlots}
                      selectedTime={field.value}
                      onSelectTime={field.onChange}
                      isLoading={loadingSlots}
                      error={slotError}
                    />
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas</FormLabel>
              <FormControl>
                <Textarea placeholder="Motivo de la consulta..." className="resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full md:w-auto" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Confirmar Turno
        </Button>
      </form>
    </Form>
  );
}