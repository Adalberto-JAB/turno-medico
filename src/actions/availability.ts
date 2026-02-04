"use server";

import { prisma } from "@/lib/prisma";
import { format, getDay, addMinutes, parse, isSameDay } from "date-fns";

export async function getAvailableSlots(doctorId: string, dateStr: string) {
  // 1. Validaciones básicas
  if (!doctorId || !dateStr) return { error: "Faltan datos", slots: [] };

  const date = new Date(dateStr);
  const dayOfWeek = getDay(date); // 0 = Domingo, 1 = Lunes...

  try {
    // 2. ¿Está de vacaciones/licencia? (Absence)
    const absence = await prisma.doctorAbsence.findFirst({
      where: {
        doctorId,
        startDate: { lte: date },
        endDate: { gte: date },
      },
    });

    if (absence) {
      return { error: `El médico no está disponible: ${absence.reason}`, slots: [] };
    }

    // 3. ¿Trabaja este día de la semana? (Schedule)
    // Nota: Como un médico puede tener doble turno (mañana y tarde), usamos findMany
    const schedules = await prisma.doctorSchedule.findMany({
      where: {
        doctorId,
        dayOfWeek: dayOfWeek, // Coincide con el día de la semana
      },
      orderBy: { startTime: 'asc' }
    });

    if (schedules.length === 0) {
      return { error: "El médico no atiende este día", slots: [] };
    }

    // 4. Buscar turnos YA ocupados en esa fecha
    // Buscamos todo lo que NO esté cancelado
    const busyAppointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        date: {
          gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
          lt: new Date(new Date(date).setHours(23, 59, 59, 999)),
        },
        status: { not: "CANCELLED" }
      },
    });

    // 5. Generación Matemática de Slots
    let allSlots: string[] = [];
    const SLOT_DURATION = 30; // Turnos de 30 minutos (configurable)

    for (const schedule of schedules) {
      // Parseamos hora inicio y fin (ej: "09:00")
      let current = parse(schedule.startTime, "HH:mm", date);
      const end = parse(schedule.endTime, "HH:mm", date);

      // Bucle mientras no nos pasemos de la hora fin
      while (current < end) {
        const slotString = format(current, "HH:mm");
        
        // Verificamos si este horario YA está ocupado
        const isBusy = busyAppointments.some(appt => {
            const apptTime = format(new Date(appt.date), "HH:mm");
            return apptTime === slotString;
        });

        if (!isBusy) {
            allSlots.push(slotString);
        }

        // Sumamos 30 minutos para el siguiente slot
        current = addMinutes(current, SLOT_DURATION);
      }
    }

    return { slots: allSlots };

  } catch (error) {
    console.error("Error calculando disponibilidad:", error);
    return { error: "Error interno al calcular horarios", slots: [] };
  }
}