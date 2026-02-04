"use server"; // 👈 La magia de Next.js: Esto asegura que el código nunca llegue al cliente

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Esquema de validación para el Action
const createSpecialtySchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
});

/**
 * Server Action para crear una especialidad.
 * Retorna { success: true, data: ... } o { success: false, error: ... }
 */
export async function createSpecialtyAction(formData: FormData) {
  const name = formData.get("name") as string;

  // 1. Validar
  const validation = createSpecialtySchema.safeParse({ name });
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }

  try {
    // 2. Crear en BD
    const newSpecialty = await prisma.specialty.create({
      data: { name: validation.data.name },
    });

    // 3. Revalidar caché (IMPORTANTE: Actualiza la UI sin recargar)
    // Esto hará que cualquier página que muestre especialidades se actualice sola
    revalidatePath("/dashboard/medicos/crear");
    
    return { success: true, data: newSpecialty };
  } catch (error) {
    return { success: false, error: "Error al crear la especialidad (¿Quizás ya existe?)" };
  }
}

/**
 * Server Action para obtener todas las especialidades.
 * Útil para llenar selects.
 */
export async function getSpecialties() {
  const specialties = await prisma.specialty.findMany({
    orderBy: { name: "asc" },
  });
  return specialties;
}