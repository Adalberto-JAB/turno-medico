import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, User, FileText, Stethoscope, ChevronLeft } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";

export default async function PatientHistoryDetailPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;

  // 1. Buscamos al paciente y sus datos básicos
  const patient = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true, image: true, role: true }
  });

  if (!patient || patient.role !== "PATIENT") return notFound();

  // 2. Buscamos TODOS los registros médicos asociados a sus turnos
  const records = await prisma.medicalRecord.findMany({
    where: {
      appointment: {
        userId: userId // Buscamos por el ID del PACIENTE
      }
    },
    include: {
      appointment: {
        include: { doctor: true } // Necesitamos saber qué médico firmó
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* HEADER DE NAVEGACIÓN */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/medico/historiales">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Historia Clínica</h2>
          <p className="text-muted-foreground text-sm">Registro unificado de atenciones.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-6">
        
        {/* === COLUMNA IZQUIERDA: PERFIL DEL PACIENTE === */}
        <div className="md:col-span-4 space-y-4">
          <Card>
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4 ring-2 ring-primary/10">
                <AvatarImage src={patient.image || ""} />
                <AvatarFallback className="text-2xl">{patient.name?.substring(0,2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-bold">{patient.name}</h3>
              <p className="text-sm text-muted-foreground">{patient.email}</p>
              
              <div className="mt-6 w-full grid grid-cols-2 gap-2 text-center text-sm">
                <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded border">
                  <span className="block font-bold text-lg">{records.length}</span>
                  <span className="text-muted-foreground text-xs">Consultas</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded border">
                  <span className="block font-bold text-lg text-green-600">Activo</span>
                  <span className="text-muted-foreground text-xs">Estado</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* === COLUMNA DERECHA: LÍNEA DE TIEMPO === */}
        <div className="md:col-span-8">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Evoluciones Médicas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-150 pr-4">
                {records.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                    <p>Este paciente aún no tiene registros médicos guardados.</p>
                  </div>
                ) : (
                  <div className="space-y-8 pl-2">
                    {records.map((record) => (
                      <div key={record.id} className="relative pl-8 border-l-2 border-slate-200 dark:border-slate-800 last:border-0 pb-1">
                        
                        {/* ICONO EN LA LÍNEA DE TIEMPO */}
                        <div className="absolute -left-2.25 top-0 bg-background">
                          <div className="h-4 w-4 rounded-full border-2 border-primary bg-primary/20" />
                        </div>

                        <div className="flex flex-col gap-2">
                          {/* FECHA Y MÉDICO */}
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary" className="font-mono">
                              {format(record.createdAt, "dd/MM/yyyy", { locale: es })}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Stethoscope className="h-3 w-3" />
                              Dr. {record.appointment.doctor.name}
                            </span>
                          </div>

                          {/* DIAGNÓSTICO */}
                          <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border">
                            <h4 className="font-bold text-lg text-primary mb-2">
                              {record.diagnosis}
                            </h4>
                            
                            {record.treatment && (
                              <div className="text-sm mb-3">
                                <span className="font-semibold text-foreground">Tratamiento / Rx:</span>
                                <p className="text-muted-foreground whitespace-pre-wrap mt-1">
                                  {record.treatment}
                                </p>
                              </div>
                            )}

                            {record.notes && (
                                <div className="mt-3 pt-3 border-t border-dashed text-xs text-yellow-700 dark:text-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/10 p-2 rounded">
                                    <span className="font-bold">Nota Interna:</span> {record.notes}
                                </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}