import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Definición de tipos para Next.js 16
type Params = Promise<{ id: string }>;

// GET: Obtener un turno específico
export async function GET(request: Request, { params }: { params: Params }) {
  const { id } = await params; // 👈 Await obligatorio en Next 16

  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: { doctor: true, user: true },
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Turno no encontrado' }, { status: 404 });
    }

    return NextResponse.json(appointment);
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

// PUT: Actualizar estado o notas
export async function PUT(request: Request, { params }: { params: Params }) {
  const { id } = await params;
  
  try {
    const body = await request.json();
    // Aquí deberíamos validar con Zod también, lo simplifico por brevedad
    
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        status: body.status,
        notes: body.notes,
        date: body.date,
      },
    });

    return NextResponse.json(updatedAppointment);
  } catch (error) {
    return NextResponse.json({ error: 'Error actualizando turno' }, { status: 500 });
  }
}

// DELETE: Cancelar/Borrar turno
export async function DELETE(request: Request, { params }: { params: Params }) {
  const { id } = await params;

  try {
    await prisma.appointment.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Turno eliminado correctamente' });
  } catch (error) {
    return NextResponse.json({ error: 'No se pudo eliminar el turno' }, { status: 500 });
  }
}

