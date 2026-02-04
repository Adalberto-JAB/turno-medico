"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { redirect } from "next/navigation";

const historySchema = z.object({
  appointmentId: z.string().min(1),
  diagnosis: z.string().min(2, "El diagnóstico es obligatorio"),
  treatment: z.string().optional(),
  notes: z.string().optional(),
});

export async function saveMedicalRecord(formData: FormData) {
  const rawData = {
    appointmentId: formData.get("appointmentId"),
    diagnosis: formData.get("diagnosis"),
    treatment: formData.get("treatment"),
    notes: formData.get("notes"),
  };

  const validated = historySchema.safeParse(rawData);

  if (!validated.success) {
    return { error: "Datos incompletos. Revisa el diagnóstico." };
  }

  const { appointmentId, diagnosis, treatment, notes } = validated.data;

  try {
    // Transacción: Guardamos Historia Y cerramos Turno a la vez
    await prisma.$transaction([
      // 1. Crear el registro médico
      prisma.medicalRecord.create({
        data: {
          appointmentId,
          diagnosis,
          treatment: treatment || "",
          notes: notes || "",
        },
      }),
      // 2. Marcar el turno como COMPLETADO
      prisma.appointment.update({
        where: { id: appointmentId },
        data: { status: "COMPLETED" as any }, // Casteo por si tu enum no tiene COMPLETED aún
      }),
    ]);

  } catch (error) {
    console.error(error);
    return { error: "Error al guardar la historia clínica." };
  }

  // Si todo sale bien, revalidamos y redirigimos
  revalidatePath("/dashboard");
  redirect("/dashboard");
}