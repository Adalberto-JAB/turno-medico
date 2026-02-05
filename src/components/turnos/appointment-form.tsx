"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { es } from "date-fns/locale";
import { format } from "date-fns";
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

// Importamos tus componentes existentes
import { TimeSlots } from "./time-slots";
import { getAvailableSlots } from "@/actions/availability";

// Definimos el esquema de validación
const formSchema = z.object({
  userId: z.string().min(1, "Selecciona un paciente"),
  doctorId: z.string().min(1, "Selecciona un médico"),
  // CORRECCIÓN ZOD: Usamos 'message' que es la propiedad universal aceptada
  date: z.date({ 
    message: "Selecciona una fecha válida" 
  }),
  time: z.string().min(1, "Selecciona una hora"),
  notes: z.string().optional(),
});

// Definimos la estructura de los datos iniciales
interface AppointmentData {
  id: string;
  userId: string;
  doctorId: string;
  date: Date | string; 
  notes: string | null;
  status: string;
}

// Actualizamos las Props para aceptar initialData
interface Props {
  patients: { id: string; name: string }[];
  doctors: { id: string; name: string }[];
  initialData?: AppointmentData;
}

export function AppointmentForm({ patients, doctors, initialData }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Estados para la lógica de slots
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    initialData ? new Date(initialData.date) : undefined
  );
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotError, setSlotError] = useState<string | null>(null);

  // Configuración del Formulario
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: initialData?.userId || "",
      doctorId: initialData?.doctorId || "",
      date: initialData ? new Date(initialData.date) : undefined,
      time: initialData ? format(new Date(initialData.date), "HH:mm") : "",
      notes: initialData?.notes || "",
    },
  });

  const watchDate = form.watch("date");
  const watchDoctorId = form.watch("doctorId");

  // Efecto para sincronizar el calendario visual
  useEffect(() => {
    if (watchDate) {
      setSelectedDate(watchDate);
    }
  }, [watchDate]);

  // Efecto para buscar slots disponibles
  useEffect(() => {
    async function fetchSlots() {
      if (!watchDate || !watchDoctorId) return;

      setLoadingSlots(true);
      setSlotError(null);
      setAvailableSlots([]);
      
      // Reseteamos la hora si cambiamos de fecha (excepto en carga inicial)
      if (!initialData || (initialData && watchDate.getTime() !== new Date(initialData.date).getTime())) {
          form.setValue("time", ""); 
      }

      try {
        const dateString = format(watchDate, "yyyy-MM-dd");
        
        // CORRECCIÓN TYPESCRIPT: Manejo seguro de la respuesta
        const response: any = await getAvailableSlots(dateString, watchDoctorId);

        if (response.error) {
            setSlotError(response.error);
            setLoadingSlots(false);
            return;
        }

        // Extraemos el array de slots de forma segura
        const slotsArray = Array.isArray(response) ? response : (response.slots || []);
        const finalSlots = [...slotsArray]; 
        
        // Si estamos editando, inyectamos la hora actual del turno
        if (initialData && format(new Date(initialData.date), "yyyy-MM-dd") === dateString) {
            const currentHour = format(new Date(initialData.date), "HH:mm");
            
            if (!finalSlots.includes(currentHour)) {
                finalSlots.push(currentHour);
                finalSlots.sort(); 
            }
             form.setValue("time", currentHour);
        }

        setAvailableSlots(finalSlots);
      } catch (error) {
        console.error(error);
        setSlotError("Error al cargar horarios");
      } finally {
        setLoadingSlots(false);
      }
    }

    fetchSlots();
  }, [watchDate, watchDoctorId, initialData, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      const fullDate = new Date(values.date);
      const [hours, minutes] = values.time.split(':');
      fullDate.setHours(parseInt(hours), parseInt(minutes));

      const payload = {
        userId: values.userId,
        doctorId: values.doctorId,
        date: fullDate.toISOString(),
        notes: values.notes,
      };

      const url = initialData 
        ? `/api/turnos/${initialData.id}`
        : `/api/turnos`;
      
      const method = initialData ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al procesar el turno");
      }

      toast.success(initialData ? "Turno actualizado" : "Turno creado");
      router.push("/dashboard/turnos");
      router.refresh();
      
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        <div className="grid gap-4 md:grid-cols-2">
          {/* PACIENTE */}
          <FormField
            control={form.control}
            name="userId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Paciente</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn("justify-between", !field.value && "text-muted-foreground")}
                      >
                        {field.value
                          ? patients.find((patient) => patient.id === field.value)?.name
                          : "Seleccionar paciente"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
                    <Command>
                      <CommandInput placeholder="Buscar paciente..." />
                      <CommandList>
                        <CommandEmpty>No se encontró.</CommandEmpty>
                        <CommandGroup>
                          {patients.map((patient) => (
                            <CommandItem
                              value={patient.name}
                              key={patient.id}
                              onSelect={() => field.onChange(patient.id)}
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

          {/* MÉDICO */}
          <FormField
            control={form.control}
            name="doctorId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Médico</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn("justify-between", !field.value && "text-muted-foreground")}
                      >
                        {field.value
                          ? doctors.find((doctor) => doctor.id === field.value)?.name
                          : "Seleccionar médico"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
                    <Command>
                      <CommandInput placeholder="Buscar médico..." />
                      <CommandList>
                        <CommandEmpty>No se encontró.</CommandEmpty>
                        <CommandGroup>
                          {doctors.map((doctor) => (
                            <CommandItem
                              value={doctor.name}
                              key={doctor.id}
                              onSelect={() => field.onChange(doctor.id)}
                            >
                              <Check
                                className={cn("mr-2 h-4 w-4", doctor.id === field.value ? "opacity-100" : "opacity-0")}
                              />
                              {doctor.name}
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

        <div className="grid gap-4 md:grid-cols-2">
          {/* CALENDARIO */}
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha del Turno</FormLabel>
                <div className="border rounded-md p-4 flex justify-center bg-slate-50 dark:bg-slate-900/50">
                    <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                        initialFocus
                        locale={es}
                        classNames={{
                            head_cell: "text-muted-foreground font-normal text-[0.8rem] capitalize",
                        }}
                    />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* TIME SLOTS */}
          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem className="flex flex-col h-full">
                <FormLabel>Horario</FormLabel>
                <div className="flex-1 border rounded-md p-4 bg-slate-50 dark:bg-slate-900/50">
                  {!selectedDate ? (
                    <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                      👈 Selecciona una fecha primero
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

        {/* NOTAS */}
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
          {initialData ? "Guardar Cambios" : "Confirmar Turno"}
        </Button>
      </form>
    </Form>
  );
}

