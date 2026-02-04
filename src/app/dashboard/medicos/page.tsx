import { prisma } from "@/lib/prisma";
import { DoctorDialog } from "@/components/medicos/doctor-dialog";
// Importamos el nuevo Dialog de Agenda
import { ScheduleDialog } from "@/components/medicos/schedule-dialog"; 

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Laptop, FileText, CheckCircle2 } from "lucide-react";

export default async function AdminDoctorsPage() {
  // 1. Buscamos Médicos INCLUYENDO SUS HORARIOS (schedules)
  const doctors = await prisma.doctor.findMany({
    include: {
      specialty: true,
      user: true, 
      schedules: true, // 👈 IMPORTANTE: Traemos la agenda para pasársela al form
    },
    orderBy: { name: 'asc' }
  });

  const specialties = await prisma.specialty.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestión de Staff Médico</h2>
          <p className="text-muted-foreground">Administra fichas, accesos y horarios.</p>
        </div>
        <DoctorDialog specialties={specialties} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Directorio de Profesionales</CardTitle>
          <CardDescription>
            Auditoría y configuración ({doctors.length} registros).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Avatar</TableHead>
                <TableHead>Profesional</TableHead>
                <TableHead>Especialidad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {doctors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No hay médicos registrados aún.
                  </TableCell>
                </TableRow>
              ) : (
                doctors.map((doc) => (
                  <TableRow key={doc.id}>
                    {/* FOTO */}
                    <TableCell>
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={doc.user?.image || ""} />
                        <AvatarFallback className="text-xs">{doc.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </TableCell>

                    {/* NOMBRE */}
                    <TableCell>
                      <div className="font-medium">{doc.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {doc.licenseNumber ? `MP: ${doc.licenseNumber}` : "Sin matrícula"}
                      </div>
                    </TableCell>

                    {/* ESPECIALIDAD */}
                    <TableCell>
                      <Badge variant="secondary" className="font-normal">{doc.specialty.name}</Badge>
                    </TableCell>

                    {/* ESTADO */}
                    <TableCell>
                      {doc.userId ? (
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-green-700 bg-green-100 dark:bg-green-900/30 w-fit px-2 py-0.5 rounded-full text-xs font-bold border border-green-200 dark:border-green-800">
                                <CheckCircle2 className="h-3 w-3" />
                                <span>Digital</span>
                            </div>
                            <div className="text-[10px] text-muted-foreground font-mono">
                                {doc.user?.email}
                            </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-slate-500 bg-slate-100 dark:bg-slate-800 w-fit px-2 py-1 rounded-full text-xs font-medium border">
                          <FileText className="h-3 w-3" />
                          <span>Analógico</span>
                        </div>
                      )}
                    </TableCell>

                    {/* ACCIONES */}
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center gap-2">
                        {/* 1. BOTÓN AGENDA (NUEVO) */}
                        <ScheduleDialog 
                          doctorId={doc.id}
                          doctorName={doc.name}
                          existingSchedule={doc.schedules} 
                        />
                        
                        {/* 2. BOTÓN EDITAR PERFIL */}
                        <DoctorDialog
                          specialties={specialties}
                          doctorToEdit={{
                            id: doc.id,
                            name: doc.name,
                            licenseNumber: doc.licenseNumber,
                            specialtyId: doc.specialtyId,
                            user: doc.user ? { email: doc.user.email } : null
                          }}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}