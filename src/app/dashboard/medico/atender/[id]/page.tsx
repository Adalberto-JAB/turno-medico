import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, Calendar, FileText, History, Stethoscope, Clock } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";

// Importamos el formulario interactivo
import { ConsultationForm } from "@/components/medicos/consultation-form";

export default async function ConsultationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 1. Buscamos el turno actual
  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: { user: true }
  });

  if (!appointment) return notFound();

  // 2. 🧠 MEMORIA: Buscamos el historial PREVIO de este paciente
  // (Buscamos MedicalRecords donde el turno asociado pertenezca a este mismo UserID)
  const history = await prisma.medicalRecord.findMany({
    where: {
      appointment: {
        userId: appointment.user.id, // Mismo paciente
        id: { not: id } // Excluimos el turno actual (por si acaso)
      }
    },
    include: {
      appointment: {
        include: { doctor: true } // Para saber qué médico lo atendió antes
      }
    },
    orderBy: { createdAt: 'desc' }, // Lo más reciente arriba
    take: 10 // Traemos las últimas 10 consultas para no saturar
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* CABECERA */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sala de Consulta</h1>
          <p className="text-muted-foreground">
            Atendiendo a <span className="font-semibold text-foreground">{appointment.user.name}</span>
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard">Cancelar / Volver</Link>
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        
        {/* === COLUMNA IZQUIERDA: DATOS + HISTORIAL (Nuevo) === */}
        <div className="md:col-span-1 space-y-6">
          
          {/* TARJETA 1: Resumen del Paciente */}
          <Card>
            <CardHeader className="bg-slate-50 dark:bg-slate-900 py-4 border-b">
              <CardTitle className="text-sm font-medium flex items-center gap-2 uppercase tracking-wide text-muted-foreground">
                <User className="h-4 w-4" />
                Datos del Paciente
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div>
                <p className="text-2xl font-bold leading-none">{appointment.user.name}</p>
                <p className="text-sm text-muted-foreground mt-1">{appointment.user.email}</p>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-100 dark:border-blue-800">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-300 mb-1">
                  <Clock className="h-3 w-3" />
                  TURNO ACTUAL
                </div>
                <p className="text-sm font-medium">
                  {format(appointment.date, "EEEE d 'de' MMMM", { locale: es })}
                </p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {format(appointment.date, "HH:mm")} hs
                </p>
                {appointment.notes && (
                  <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-blue-800 dark:text-blue-200 italic">"{appointment.notes}"</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* TARJETA 2: Historial Clínico (Línea de Tiempo) */}
          <Card className="flex flex-col h-125"> {/* Altura fija para scroll */}
            <CardHeader className="pb-3 border-b">
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-purple-500" />
                Historial Clínico
              </CardTitle>
              <CardDescription>
                {history.length > 0 ? `Últimas ${history.length} visitas.` : "Sin antecedentes registrados."}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-6">
                  {history.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground text-sm">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-20" />
                      Este paciente no tiene consultas previas en el sistema.
                    </div>
                  ) : (
                    history.map((record) => (
                      <div key={record.id} className="relative pl-4 border-l-2 border-slate-200 dark:border-slate-800 pb-2 last:pb-0">
                        {/* Bolita de la línea de tiempo */}
                        <div className="absolute -left-1.25 top-0 h-2.5 w-2.5 rounded-full bg-purple-400 ring-4 ring-white dark:ring-slate-950" />
                        
                        <div className="space-y-1 mb-1">
                          <p className="text-xs font-bold text-muted-foreground uppercase">
                            {format(record.createdAt, "d MMM yyyy", { locale: es })}
                          </p>
                          <h4 className="font-bold text-sm text-foreground">
                            {record.diagnosis}
                          </h4>
                        </div>
                        
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                          <Stethoscope className="h-3 w-3" />
                          Dr. {record.appointment.doctor.name}
                        </div>

                        {record.treatment && (
                          <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded text-xs text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                            <span className="font-semibold">Tx:</span> {record.treatment}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

        </div>

        {/* === COLUMNA DERECHA: FORMULARIO === */}
        <Card className="md:col-span-2 border-l-4 border-l-green-500 shadow-lg h-fit">
          <CardHeader className="bg-green-50/50 dark:bg-green-900/10">
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <FileText className="h-6 w-6" />
              Nueva Evolución
            </CardTitle>
            <CardDescription>
              Complete los detalles de la consulta actual para cerrar el turno.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ConsultationForm appointmentId={appointment.id} />
          </CardContent>
        </Card>

      </div>
    </div>
  );
}