"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signIn } from "@/lib/auth-client";
import { Form } from "@/components/ui/form";

// 👇 Importamos nuestros componentes reutilizables
import { AuthCard, AuthInput, SubmitButton } from "./auth-ui";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    await signIn.email({
      email: values.email, password: values.password,
    }, {
      onRequest: () => setLoading(true),
      onSuccess: () => {
        toast.success("Bienvenido de nuevo");
        router.push("/dashboard");
      },
      onError: (ctx) => {
        setLoading(false);
        toast.error(ctx.error.message || "Credenciales incorrectas");
      },
    });
  }

  return (
    <AuthCard
      title="Iniciar Sesión"
      description="Ingresa al Sistema de Gestión de Turnos"
      footerText="¿No tienes cuenta?"
      footerLinkText="Regístrate aquí"
      footerLinkHref="/register"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <AuthInput control={form.control} name="email" label="Email" placeholder="tu@email.com" />
          <AuthInput control={form.control} name="password" label="Contraseña" type="password" placeholder="******" />
          
          <SubmitButton loading={loading} text="Ingresar" />
        </form>
      </Form>
    </AuthCard>
  );
}