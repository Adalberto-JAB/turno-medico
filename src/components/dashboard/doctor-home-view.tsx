import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, User, FileText } from "lucide-react";
import { ScheduleForm } from "@/components/medicos/schedule-form";
import { format, startOfDay, endOfDay } from "date-fns"; // 👈 Helpers para fechas más seguras
import { es } from "date-fns/locale";
import Link from "next/link"; // 👈 Importamos Link

interface Props {
  doctorId: string;
}

export default async function DoctorHomeView({ doctorId }: Props) {
  // 1. Buscamos datos del médico y sus turnos de HOY
  // Usamos startOfDay/endOfDay para asegurar que cubrimos todo el día local
  const todayStart = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());

  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
    include: {
      schedules: true,
      appointments: {
        where: {
          date: { gte: todayStart, lte: todayEnd },
          status: "CONFIRMED" // Mantenemos tu política: Solo confirmados
        },
        include: { user: true },
        orderBy: { date: 'asc' }
      }
    }
  });

  if (!doctor) return <div>Error: No se encontró el perfil del médico.</div>;

  return (
    <Tabs defaultValue="hoy" className="space-y-4">
      <TabsList>
        <TabsTrigger value="hoy">Pacientes de Hoy</TabsTrigger>
        <TabsTrigger value="agenda">Mi Agenda</TabsTrigger>
      </TabsList>

      {/* TAB 1: PACIENTES */}
      <TabsContent value="hoy" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {doctor.appointments.length === 0 ? (
            <Card className="col-span-full py-8">
              <div className="flex flex-col items-center justify-center text-center text-muted-foreground">
                <CalendarDays className="h-12 w-12 mb-4 opacity-20" />
                <p>No tienes turnos confirmados para hoy. ¡Disfruta el café! ☕</p>
              </div>
            </Card>
          ) : (
            doctor.appointments.map((turno) => (
              <Card key={turno.id} className="border-l-4 border-l-primary">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <Badge variant="secondary">
                      {format(turno.date, "HH:mm", { locale: es })} hs
                    </Badge>
                    
                    {/* 🟢 AQUÍ ESTÁ EL CAMBIO CLAVE */}
                    <Button size="sm" asChild>
                      <Link href={`/dashboard/medico/atender/${turno.id}`}>
                        Atender
                      </Link>
                    </Button>

                  </div>
                  <CardTitle className="text-lg flex items-center gap-2 mt-2">
                    <User className="h-4 w-4" />
                    {turno.user.name}
                  </CardTitle>
                  <CardDescription>{turno.notes || "Sin notas"}</CardDescription>
                </CardHeader>
              </Card>
            ))
          )}
        </div>
      </TabsContent>

      {/* TAB 2: AGENDA */}
      <TabsContent value="agenda">
        <Card>
          <CardHeader>
            <CardTitle>Configuración de Disponibilidad</CardTitle>
            <CardDescription>Define tus horarios laborales.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScheduleForm doctorId={doctor.id} initialSchedule={doctor.schedules} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}