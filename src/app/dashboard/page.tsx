import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Copy, ShieldAlert } from "lucide-react";
import AdminStatsView from "@/components/dashboard/admin-stats-view";
import DoctorHomeView from "@/components/dashboard/doctor-home-view";
import PatientHomeView from "@/components/dashboard/patient-home-view";

export const dynamic = 'force-dynamic';

export default async function DashboardRootPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect("/login");
  }

  const role = session.user.role || "";
  // Forzamos el tipado para evitar errores de TS
  const doctorId = (session.user as any).doctorId as string | undefined;

  // ----------------------------------------------------------------------
  // 🏥 LÓGICA DE MÉDICO (BLINDADA)
  // ----------------------------------------------------------------------
  if (role === "DOCTOR") {
    // 1. Buscamos al médico por su ID de Usuario (La forma correcta)
    const doctor = await prisma.doctor.findUnique({
      where: { userId: session.user.id },
      include: {
        schedules: true,
        appointments: {
          where: {
            date: {
              gte: new Date(new Date().setHours(0,0,0,0)),
              lte: new Date(new Date().setHours(23,59,59,999))
            },
            status: "CONFIRMED"
          },
          include: { user: true },
          orderBy: { date: 'asc' }
        }
      }
    });

    // 2. SI NO ENCUENTRA EL PERFIL -> MOSTRAMOS EL DIAGNÓSTICO
    if (!doctor) {
      return (
        <div className="flex h-[80vh] items-center justify-center p-4">
          <Card className="max-w-lg w-full border-red-200 shadow-lg">
            <CardHeader className="bg-red-50 dark:bg-red-950/30 rounded-t-lg pb-6">
              <div className="flex items-center gap-2 text-red-600 mb-2">
                <ShieldAlert className="h-6 w-6" />
                <h2 className="text-xl font-bold">Error de Vinculación</h2>
              </div>
              <CardDescription className="text-red-700/80">
                Tu usuario tiene permisos de médico, pero no encontramos tu ficha profesional.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Para solucionar esto, necesitas pedirle al Administrador que vincule tu ficha médica con este identificador exacto:
                </p>
                
                <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-md border font-mono text-xs break-all relative group">
                  <p className="text-slate-500 mb-1 uppercase text-[10px] font-bold">Tu ID de Usuario (Sesión Actual):</p>
                  <div className="text-base font-bold text-slate-800 dark:text-slate-200 select-all">
                    {session.user.id}
                  </div>
                  <p className="text-slate-500 mt-2 uppercase text-[10px] font-bold">Tu Email:</p>
                  <div className="text-sm text-slate-700 dark:text-slate-300">
                    {session.user.email}
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/10 p-3 rounded-md text-xs text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800">
                <strong>¿Eres el Administrador?</strong>
                <ul className="list-disc pl-4 mt-1 space-y-1">
                  <li>Entra con tu cuenta de Admin.</li>
                  <li>Ve a <em>Gestión de Médicos</em>.</li>
                  <li>Edita al médico correspondiente.</li>
                  <li>Vuelve a escribir el email: <u>{session.user.email}</u> y guarda.</li>
                  <li>Eso actualizará el ID interno al que ves aquí arriba.</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // 3. SI LO ENCUENTRA -> MOSTRAMOS EL DASHBOARD
    return <DoctorHomeView doctorId={doctor.id} />;
  }

  // ----------------------------------------------------------------------
  // 🛡️ LÓGICA ADMIN
  // ----------------------------------------------------------------------
  if (role === "ADMIN") {
    return <AdminStatsView />;
  }

  // ----------------------------------------------------------------------
  // 👤 LÓGICA PACIENTE
  // ----------------------------------------------------------------------
  if (role === "PATIENT") {
    return <PatientHomeView />;
  }

  // FALLBACK
  return (
    <div className="p-8 text-center">
      <h3 className="text-lg font-bold text-red-500">Acceso Restringido</h3>
      <p>Tu rol ({role}) no tiene panel asignado.</p>
    </div>
  );
}