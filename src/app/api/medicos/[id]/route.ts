import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validamos el body para la edición
const updateDoctorSchema = z.object({
  name: z.string().min(2),
  specialtyId: z.string().min(1),
  licenseNumber: z.string().min(1),
});

interface RouteProps {
  params: Promise<{ id: string }>;
}

// PUT: Actualizar Médico
export async function PUT(req: Request, { params }: RouteProps) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = updateDoctorSchema.parse(body);

    const updatedDoctor = await prisma.doctor.update({
      where: { id },
      data: {
        name: data.name,
        specialtyId: data.specialtyId,
        licenseNumber: data.licenseNumber,
      },
    });

    return NextResponse.json(updatedDoctor);
  } catch (error) {
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}

// DELETE: Eliminar Médico
export async function DELETE(req: Request, { params }: RouteProps) {
  try {
    const { id } = await params;

    // Verificar si tiene turnos asociados antes de borrar
    // (Opcional: Prisma lanzaría error si hay restricción de FK, pero es mejor verificar)
    const appointmentsCount = await prisma.appointment.count({
      where: { doctorId: id },
    });

    if (appointmentsCount > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar: El médico tiene turnos asociados." },
        { status: 400 }
      );
    }

    await prisma.doctor.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  }
}

