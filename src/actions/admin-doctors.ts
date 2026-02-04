"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ESQUEMA DE VALIDACIÓN
const doctorSchema = z.object({
  id: z.string().optional(), 
  name: z.string().min(2, "El nombre es obligatorio"),
  specialtyId: z.string().min(1, "Debe seleccionar una especialidad"),
  licenseNumber: z.string().optional(),
  // 👇 Validación Robusta: Acepta email válido O string vacío
  email: z.union([z.literal(""), z.string().email("El formato del email es incorrecto")]),
});

export async function createOrUpdateDoctor(prevState: any, formData: FormData) {
  // 1. SANITIZACIÓN DE DATOS (El paso clave que faltaba)
  // Convertimos los 'null' de FormData en formatos que Zod acepte
  const rawData = {
    id: formData.get("id")?.toString() || undefined, // Si es null (creación), pasa a undefined
    name: formData.get("name"),
    specialtyId: formData.get("specialtyId"),
    licenseNumber: formData.get("licenseNumber")?.toString() || "", // Si es null, pasa a ""
    email: formData.get("email")?.toString() || "", // Si es null, pasa a ""
  };

  // 2. VALIDACIÓN
  const validated = doctorSchema.safeParse(rawData);

  if (!validated.success) {
    // Tip: Devolvemos el primer error específico para ayudar al usuario
    const firstError = Object.values(validated.error.flatten().fieldErrors)[0]?.[0];
    return { 
      success: false, 
      message: firstError || "Datos inválidos. Revisa el formulario.",
      errors: validated.error.flatten().fieldErrors 
    };
  }

  const { id, name, specialtyId, licenseNumber, email } = validated.data;
  let userIdToLink = null;

  try {
    // 3. LÓGICA DE VINCULACIÓN (Solo si hay email)
    if (email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        userIdToLink = existingUser.id;
        
        // Si el usuario existe, le damos rol DOCTOR automáticamente
        if (existingUser.role !== "DOCTOR") {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: { role: "DOCTOR" }
          });
        }
      }
    }

    const dataPayload = {
      name,
      specialtyId,
      licenseNumber: licenseNumber || null,
      // Solo actualizamos userId si encontramos uno nuevo o si estamos creando.
      // Si estamos editando y no pusimos email, mantenemos el vínculo anterior (o null si así se desea).
      // En este caso, si email viene vacío, userIdToLink es null, lo que desvincularía al médico (correcto para "modo ficha").
      userId: userIdToLink, 
    };

    if (id) {
      // 🔄 MODO EDICIÓN
      await prisma.doctor.update({
        where: { id },
        data: dataPayload,
      });
    } else {
      // ✨ MODO CREACIÓN
      await prisma.doctor.create({
        data: {
          ...dataPayload,
        },
      });
    }

    revalidatePath("/dashboard/medicos");
    return { success: true, message: id ? "Médico actualizado correctamente" : "Médico creado correctamente" };
    
  } catch (error) {
    console.error(error);
    return { success: false, message: "Error al guardar. Verifica los datos." };
  }
}