import { DoctorForm } from "@/components/medicos/doctor-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSpecialties } from "@/actions/specialties"; // 👈 Usamos el Server Action aquí

export default async function CreateDoctorPage() {
  // Obtenemos las especialidades directamente en el servidor
  const specialties = await getSpecialties();

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Registrar Profesional</CardTitle>
          <CardDescription>
            Ingrese los datos del nuevo médico para el sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DoctorForm specialties={specialties} /> {/* 👈 Las pasamos al formulario */}
        </CardContent>
      </Card>
    </div>
  );
}