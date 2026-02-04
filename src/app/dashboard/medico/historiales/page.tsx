import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Clock, Users } from "lucide-react";
import Link from "next/link";
import { PatientSearch } from "@/components/medicos/patient-search";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default async function MedicalHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const query = (await searchParams).q || "";

  // LÓGICA DE BÚSQUEDA
  // Buscamos usuarios que tengan rol PATIENT y coincidan con el texto
  const patients = await prisma.user.findMany({
    where: {
      role: "PATIENT",
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
      ],
      // Solo mostramos pacientes que tengan al menos UN turno (para no ensuciar con registros vacíos)
      appointments: {
        some: {} 
      }
    },
    take: 20, // Limitamos a 20 resultados
    include: {
      _count: {
        select: { appointments: true } // Contamos cuántas veces vino
      },
      appointments: {
        orderBy: { date: 'desc' },
        take: 1 // Traemos solo la última visita para mostrar la fecha
      }
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Archivo de Pacientes</h2>
          <p className="text-muted-foreground">Consulta los antecedentes médicos de cualquier paciente.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/50 pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle>Directorio</CardTitle>
              <CardDescription>
                {query 
                  ? `Resultados para "${query}"` 
                  : "Pacientes recientes del consultorio"}
              </CardDescription>
            </div>
            <PatientSearch />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Foto</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead className="hidden md:table-cell">Última Visita</TableHead>
                <TableHead className="text-center">Historial</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center">
                      <Users className="h-8 w-8 mb-2 opacity-20" />
                      <p>No se encontraron pacientes con ese nombre.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                patients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell>
                      <Avatar>
                        <AvatarImage src={patient.image || ""} />
                        <AvatarFallback>{patient.name?.substring(0,2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{patient.name}</div>
                      <div className="text-xs text-muted-foreground">{patient.email}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {patient.appointments[0] ? (
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          {format(patient.appointments[0].date, "d MMM yyyy", { locale: es })}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Sin visitas previas</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="font-mono">
                        {patient._count.appointments} Visitas
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/medico/historiales/${patient.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Ficha
                        </Link>
                      </Button>
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

