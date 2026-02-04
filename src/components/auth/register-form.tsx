"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signUp } from "@/lib/auth-client";
import { Form } from "@/components/ui/form";

import { AuthCard, AuthInput, SubmitButton } from "./auth-ui";

const registerSchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  confirmPassword: z.string().min(6, "Confirma contraseña"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    await signUp.email({
      email: values.email, password: values.password, name: values.name,
    }, {
      onRequest: () => setLoading(true),
      onSuccess: () => {
        toast.success("Cuenta creada exitosamente");
        router.push("/dashboard");
      },
      onError: (ctx) => {
        setLoading(false);
        toast.error(ctx.error.message || "Error al crear cuenta");
      },
    });
  }

  return (
    <AuthCard
      title="Crear Cuenta"
      description="Únete a nuestra plataforma de salud"
      footerText="¿Ya tienes cuenta?"
      footerLinkText="Inicia sesión"
      footerLinkHref="/sign-in"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <AuthInput control={form.control} name="name" label="Nombre Completo" placeholder="Ej: Dra. Ana García" />
          <AuthInput control={form.control} name="email" label="Correo Electrónico" placeholder="nombre@ejemplo.com" />
          
          <div className="grid gap-4 md:grid-cols-2">
            <AuthInput control={form.control} name="password" label="Contraseña" type="password" placeholder="******" />
            <AuthInput control={form.control} name="confirmPassword" label="Confirmar" type="password" placeholder="******" />
          </div>

          <SubmitButton loading={loading} text="Crear Cuenta" />
        </form>
      </Form>
    </AuthCard>
  );
}