import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Stethoscope, Activity, CalendarCheck } from "lucide-react";
import { ChartsView } from "@/components/dashboard/reports/charts-view";

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  
  // 1. OBTENCIÓN DE DATOS (Database)
  const totalAppointments = await prisma.appointment.count();
  
  const appointmentsByStatus = await prisma.appointment.groupBy({
    by: ['status'],
    _count: true,
  });

  const totalPatients = await prisma.user.count({ where: { role: "PATIENT" } });
  const totalDoctors = await prisma.doctor.count();

  const doctorsWithStats = await prisma.doctor.findMany({
    include: {
      specialty: true,
      _count: {
        select: { appointments: true }
      }
    },
    orderBy: {
      appointments: { _count: 'desc' }
    },
    take: 5 // Solo el Top 5
  });

  // 2. TRANSFORMACIÓN DE DATOS (La clave del arreglo 🛠️)
  
  // A. Para el Gráfico de Torta (Status)
  /*
  const chartDataStatus = appointmentsByStatus.map((item) => ({
    name: item.status,   // Prisma devuelve 'status'
    value: item._count,  // Prisma devuelve '_count' -> Lo pasamos a 'value'
  }));
  */

  // A. Para el Gráfico de Torta (Status)
  const chartDataStatus = appointmentsByStatus.map((item) => {
    // BLINDAJE: Aseguramos que sea número, aunque venga como objeto { _all: 5 }
    const countValue = typeof item._count === 'number' 
        ? item._count 
        : (item._count as any)._all || 0; 
        
    return {
      name: item.status,
      value: countValue,
    };
  });

  // B. Para el Gráfico de Barras (Especialidades)
  // Calculamos esto sumando los turnos de los médicos de cada especialidad
  const specialtyMap = new Map<string, number>();

  // Necesitamos traer TODOS los médicos para este cálculo, no solo el top 5
  const allDoctors = await prisma.doctor.findMany({
    include: {
      specialty: true,
      _count: { select: { appointments: true } }
    }
  });

  allDoctors.forEach((doc) => {
    const specName = doc.specialty.name;
    const count = doc._count.appointments;
    const current = specialtyMap.get(specName) || 0;
    specialtyMap.set(specName, current + count);
  });

  const chartDataSpecialty = Array.from(specialtyMap.entries()).map(([name, value]) => ({
    name,
    value,
  }));

  // C. Para el Ranking (Top Doctors)
  const topDoctorsData = doctorsWithStats.map((doc) => ({
    name: doc.name,
    appointments: doc._count.appointments,
  }));

  // 3. RENDERIZADO
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Reportes y Estadísticas</h2>

      {/* TARJETAS KPI SUPERIORES */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Turnos Totales</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAppointments}</div>
            <p className="text-xs text-muted-foreground">Histórico completo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pacientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPatients}</div>
            <p className="text-xs text-muted-foreground">Registrados en plataforma</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staff Médico</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDoctors}</div>
            <p className="text-xs text-muted-foreground">Profesionales activos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Demanda</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {/* Calculamos un promedio simple */}
            <div className="text-2xl font-bold">
               {totalDoctors > 0 ? (totalAppointments / totalDoctors).toFixed(1) : 0}
            </div>
            <p className="text-xs text-muted-foreground">Turnos por médico (avg)</p>
          </CardContent>
        </Card>
      </div>

      {/* SECCIÓN DE GRÁFICOS (Pasamos los datos ya transformados) */}
      <ChartsView 
        dataStatus={chartDataStatus} 
        dataSpecialty={chartDataSpecialty}
        topDoctors={topDoctorsData}
      />
    </div>
  );
}

