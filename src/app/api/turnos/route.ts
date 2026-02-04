import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

// Esquema de validación (Recuerda: .min(1) en lugar de .cuid())
const createAppointmentSchema = z.object({
    userId: z.string().min(1, "El ID del paciente es obligatorio"), 
    doctorId: z.string().min(1, "El ID del médico es obligatorio"),
    date: z.string(), 
    notes: z.string().optional(),
    status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']).default('PENDING'),
});

export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({
        include: {
            user: { select: { name: true, email: true } },
            doctor: { select: { name: true, specialty: { select: { name: true } } } }
        },
        orderBy: { date: 'desc' }
    });
    return NextResponse.json(appointments);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener turnos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createAppointmentSchema.parse(body);

    // Validación de seguridad de Roles
    if (session.user.role !== 'ADMIN') {
        if (validatedData.userId !== session.user.id) {
             return NextResponse.json(
                 { error: 'No puedes crear turnos para otros usuarios' }, 
                 { status: 403 }
             );
        }
    }

    // 🛑 LOGICA ANTI-OVERBOOKING (NUEVO BLOQUE)
    // Buscamos si ya existe un turno con ese médico, en esa fecha y hora exacta.
    const conflictiveAppointment = await prisma.appointment.findFirst({
        where: {
            doctorId: validatedData.doctorId, // Mismo médico
            date: validatedData.date,         // Misma hora exacta
            status: {
                not: 'CANCELLED'              // Ignoramos los cancelados (esos sí dejan el hueco libre)
            }
        }
    });

    if (conflictiveAppointment) {
        return NextResponse.json(
            { error: 'El médico ya tiene un turno asignado en ese horario.' }, 
            { status: 409 } // 409 Conflict
        );
    }

    // Si no hay conflicto, creamos el turno
    const newAppointment = await prisma.appointment.create({
      data: {
        userId: validatedData.userId,
        doctorId: validatedData.doctorId,
        date: validatedData.date,
        notes: validatedData.notes,
        status: validatedData.status,
      },
    });

    return NextResponse.json(newAppointment, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json(
      { error: 'Error al crear el turno' }, 
      { status: 500 }
    );
  }
}