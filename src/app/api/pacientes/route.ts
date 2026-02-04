import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth'; // Importamos la instancia de servidor de Auth
import { z } from 'zod';
import { headers } from 'next/headers'; // Necesario para Better Auth

const createPatientSchema = z.object({
  name: z.string().min(2, "El nombre es muy corto"),
  email: z.string().email("Email inválido"),
});

// GET: Obtener todos los pacientes (Igual que antes)
export async function GET() {
  try {
    const patients = await prisma.user.findMany({
      where: { role: 'PATIENT' },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { appointments: true }
        }
      }
    });
    return NextResponse.json(patients);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener pacientes' }, 
      { status: 500 }
    );
  }
}

// POST: Crear nuevo paciente usando Better Auth
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = createPatientSchema.parse(body);

    // 1. Usamos Better Auth para crear el usuario y hashear password
    // La password será igual al email, como pediste.
    const user = await auth.api.signUpEmail({
      body: {
        email: validatedData.email,
        password: validatedData.email, // Password = Email
        name: validatedData.name,
      },
      headers: await headers() // Better Auth necesita los headers
    });

    if (!user) {
        return NextResponse.json({ error: 'Error al crear usuario en Auth' }, { status: 500 });
    }

    // 2. Actualizamos el usuario para darle rol de PACIENTE y verificar email
    // Better Auth crea usuarios como "user" por defecto. Nosotros forzamos "PATIENT".
    const updatedUser = await prisma.user.update({
        where: { id: user.user.id },
        data: {
            role: 'PATIENT',
            emailVerified: true
        }
    });

    return NextResponse.json(updatedUser, { status: 201 });

  } catch (error: any) {
    // Manejo de errores de Better Auth (ej: email duplicado)
    if (error?.body?.message) {
         return NextResponse.json({ error: error.body.message }, { status: 400 });
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Error al procesar la solicitud' }, 
      { status: 500 }
    );
  }
}