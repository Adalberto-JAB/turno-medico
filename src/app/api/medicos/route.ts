import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Esquema de validación para el Backend
const createDoctorSchema = z.object({
  name: z.string().min(2, "El nombre es muy corto"),
  specialtyId: z.string().min(2, "La especialidad es requerida"),
  licenseNumber: z.string().min(1, "La matrícula es requerida"),
});

export async function GET() {
  try {
    const doctors = await prisma.doctor.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(doctors);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener médicos' }, 
      { status: 500 }
    );
  }
}

// Agregamos el POST
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = createDoctorSchema.parse(body);

    const newDoctor = await prisma.doctor.create({
      data: {
        name: validatedData.name,
        specialtyId: validatedData.specialtyId,
        licenseNumber: validatedData.licenseNumber,
      },
    });

    return NextResponse.json(newDoctor, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Error al crear el médico' }, 
      { status: 500 }
    );
  }
}

