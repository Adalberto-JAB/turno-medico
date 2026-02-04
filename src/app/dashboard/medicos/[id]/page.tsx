import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ScheduleForm } from "@/components/medicos/schedule-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, UserCog } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>; // En Next.js 15+ params es una Promesa
}

export default async function DoctorDetailPage({ params }: PageProps) {
  // Esperamos a que los params se resuelvan
  const { id } = await params;

  // 1. Buscamos el médico con su especialidad y horario
  const doctor = await prisma.doctor.findUnique({
    where: { id },
    include: {
      specialty: true,
      schedules: {
        orderBy: { dayOfWeek: 'asc' } // Ordenamos lunes a domingo
      }
    },
  });

  if (!doctor) {
    return notFound();
  }

  return (
    <div className="space-y-6">
      {/* HEADER DE NAVEGACIÓN */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/medicos">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{doctor.name}</h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Badge variant="secondary">{doctor.specialty.name}</Badge>
            <span>• Matrícula: {doctor.licenseNumber || "N/A"}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUMNA IZQUIERDA: DATOS BÁSICOS (Placeholder para futuro form de edición de datos) */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCog className="h-5 w-5" />
                Datos Profesionales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-1">
                <span className="text-sm font-medium text-muted-foreground">Nombre Completo</span>
                <span>{doctor.name}</span>
              </div>
              <div className="grid gap-1">
                <span className="text-sm font-medium text-muted-foreground">Especialidad</span>
                <span>{doctor.specialty.name}</span>
              </div>
              <div className="grid gap-1">
                <span className="text-sm font-medium text-muted-foreground">ID Interno</span>
                <code className="text-xs bg-muted p-1 rounded">{doctor.id}</code>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* COLUMNA DERECHA: CONFIGURACIÓN DE AGENDA (Donde ocurre la magia) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle>Configuración de Agenda</CardTitle>
              <CardDescription>
                Define los días y franjas horarias en las que este médico recibe turnos.
                Los cambios impactarán inmediatamente en la disponibilidad de nuevos turnos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* 👇 Aquí inyectamos el componente interactivo */}
              <ScheduleForm 
                doctorId={doctor.id} 
                initialSchedule={doctor.schedules} 
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}