import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AppointmentForm } from "@/components/turnos/appointment-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAppointmentPage({ params }: PageProps) {
  // 1. Obtener el ID de la URL
  const { id } = await params;

  // 2. Buscar datos en paralelo (Turno, Médicos, Pacientes)
  const [appointment, patients, doctors] = await Promise.all([
    prisma.appointment.findUnique({
      where: { id },
    }),
    prisma.user.findMany({
      where: { role: "PATIENT" },
      select: { id: true, name: true },
    }),
    prisma.doctor.findMany({
      select: { id: true, name: true },
    }),
  ]);

  // Si no existe el turno, devolvemos 404
  if (!appointment) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Editar Turno</CardTitle>
          <CardDescription>
            Modifique los datos del turno existente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AppointmentForm 
            patients={patients} 
            doctors={doctors} 
            initialData={appointment} // 👈 Pasamos los datos del turno
          />
        </CardContent>
      </Card>
    </div>
  );
}