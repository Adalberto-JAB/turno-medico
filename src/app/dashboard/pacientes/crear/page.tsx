import { PatientForm } from "@/components/pacientes/patient-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CreatePatientPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Registrar Paciente</CardTitle>
          <CardDescription>
            Alta manual de un nuevo usuario. Se le asignará la contraseña temporal '123456'.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PatientForm />
        </CardContent>
      </Card>
    </div>
  );
}