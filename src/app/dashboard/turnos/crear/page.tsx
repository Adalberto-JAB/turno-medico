import { prisma } from "@/lib/prisma";
import { AppointmentForm } from "@/components/turnos/appointment-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth"; 
import { headers } from "next/headers";

export default async function CreateAppointmentPage() {
  // 1. Obtener la sesión para saber quién está creando el turno
  const session = await auth.api.getSession({
    headers: await headers()
  });

  // 2. Buscar datos para los selectores
  const [patients, doctors] = await Promise.all([
    // Si es paciente, técnicamente no necesitamos cargar TODOS los pacientes, 
    // pero mantenemos la query por si entra un Admin.
    prisma.user.findMany({
      where: { role: "PATIENT" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
      take: 1000, 
    }),
    prisma.doctor.findMany({
      select: { id: true, name: true, specialty: { select: { name: true } } },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Nuevo Turno</CardTitle>
          <CardDescription>
            Complete los datos para agendar una nueva cita médica.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AppointmentForm 
            patients={patients} 
            doctors={doctors} 
            // 3. 👇 Pasamos el usuario actual al formulario
            currentUser={session?.user} 
          />
        </CardContent>
      </Card>
    </div>
  );
}