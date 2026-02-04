"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { authClient, signOut } from "@/lib/auth-client"; // 👈 Importamos signOut
import { Loader2, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("Las nuevas contraseñas no coinciden");
      setLoading(false);
      return;
    }

    if (passwords.newPassword.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres");
      setLoading(false);
      return;
    }

    try {
      await authClient.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
        revokeOtherSessions: true, 
      }, {
        onSuccess: async () => {
          // 1. Notificamos al usuario ANTES de que se vaya la página
          toast.success("Contraseña actualizada. Por favor, inicia sesión nuevamente.");
          
          // 2. Cerramos la sesión localmente
          await signOut();

          // 3. Redirigimos al Login
          router.push("/login");
        },
        onError: (ctx) => {
          toast.error(ctx.error.message || "Error al actualizar contraseña");
          setLoading(false); // Solo quitamos loading si falla
        }
      });
      // Nota: No ponemos setLoading(false) en onSuccess porque queremos que el botón
      // siga deshabilitado mientras redirige para evitar doble clic.
      
    } catch (error) {
      toast.error("Ocurrió un error inesperado");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 mt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Mi Perfil</h2>
        <p className="text-muted-foreground">Gestiona tu seguridad y datos personales.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Cambiar Contraseña
          </CardTitle>
          <CardDescription>
            Por seguridad, al cambiar tu contraseña se cerrará la sesión automáticamente y deberás ingresar de nuevo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Contraseña Actual</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                placeholder="••••••••"
                required
                value={passwords.currentPassword}
                onChange={handleChange}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nueva Contraseña</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  required
                  value={passwords.newPassword}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Repite la nueva contraseña"
                  required
                  value={passwords.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Actualizar y Cerrar Sesión
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}