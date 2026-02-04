import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, CalendarClock } from "lucide-react";
import Link from "next/link";

export default function PatientHomeView() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Tarjeta de Acción Principal: Sacar Turno */}
      <Card className="bg-primary text-primary-foreground">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5" />
            Nuevo Turno
          </CardTitle>
          <CardDescription className="text-primary-foreground/80">
            Reserva una cita con nuestros especialistas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/dashboard/turnos/crear">
            <Button variant="secondary" className="w-full font-bold">
              Reservar Ahora
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Tarjeta Secundaria: Mis Turnos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5" />
            Mis Turnos
          </CardTitle>
          <CardDescription>
            Revisa tus próximas citas o historial.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/dashboard/mis-turnos">
            <Button variant="outline" className="w-full">
              Ver Historial
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

