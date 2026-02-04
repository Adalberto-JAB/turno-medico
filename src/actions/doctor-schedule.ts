"use server";

import { auth } from "@/lib/auth"; // Ajusta según tu path real de auth
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

interface ScheduleItem {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export async function updateDoctorSchedule(doctorId: string, schedules: ScheduleItem[]) {
  try {
    // 1. Verificar Sesión
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || !session.user) {
      return { error: "No autorizado. Inicia sesión." };
    }

    const { role } = session.user;
    const userId = session.user.id;

    // 2. VALIDACIÓN DE PERMISOS (RBAC Híbrido)
    let canEdit = false;

    if (role === "ADMIN") {
      // El Admin puede editar a CUALQUIERA
      canEdit = true;
    } else if (role === "DOCTOR") {
      // El Doctor solo puede editar SU PROPIA agenda
      // Buscamos si el doctorId que intentan editar pertenece a este usuario
      const doctorProfile = await prisma.doctor.findUnique({
        where: { id: doctorId },
      });

      if (doctorProfile && doctorProfile.userId === userId) {
        canEdit = true;
      }
    }

    if (!canEdit) {
      return { error: "No tienes permiso para modificar esta agenda." };
    }

    // 3. TRANSACCIÓN ATÓMICA (Borrar anterior + Crear nueva)
    // Esto es más limpio que intentar actualizar registro por registro
    await prisma.$transaction(async (tx) => {
      // A. Borrar horarios existentes de ese médico
      await tx.doctorSchedule.deleteMany({
        where: { doctorId },
      });

      // B. Insertar los nuevos (si hay alguno)
      if (schedules.length > 0) {
        await tx.doctorSchedule.createMany({
          data: schedules.map((s) => ({
            doctorId,
            dayOfWeek: s.dayOfWeek,
            startTime: s.startTime,
            endTime: s.endTime,
          })),
        });
      }
    });

    // 4. Revalidar para que la UI se actualice
    revalidatePath("/dashboard/medico");      // Vista del Doctor
    revalidatePath("/dashboard/medicos");     // Vista del Admin
    
    return { success: true };

  } catch (error) {
    console.error("Error actualizando agenda:", error);
    return { error: "Error interno del servidor al guardar horarios." };
  }
}