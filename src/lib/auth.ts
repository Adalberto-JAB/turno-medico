import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        input: false,
      },
    },
  },
  // 🟢 AGREGAMOS ESTO: Callback para enriquecer la sesión
  callbacks: {
    // async session({ session, user }) {
    // 🟢 CORRECCIÓN: Tipamos explícitamente los parámetros
    async session({ session, user }: { session: any, user: any }) {

      // 1. Preparamos una variable para el ID del médico
      let doctorId = null;

      // 2. Si el usuario tiene el rol DOCTOR, buscamos su ficha médica
      if (user.role === "DOCTOR") {
        const doctor = await prisma.doctor.findUnique({
          where: { userId: user.id }, // Usamos el enlace que creamos en el Schema
          select: { id: true },
        });
        
        if (doctor) {
          doctorId = doctor.id;
        }
      }

      // 3. Devolvemos la sesión modificada con el nuevo dato
      return {
        ...session,
        user: {
          ...session.user,
          doctorId: doctorId, // 💉 Aquí inyectamos el ID
        },
      };
    },
  },
});