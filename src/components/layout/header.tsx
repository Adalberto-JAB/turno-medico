"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  Stethoscope, 
  LogOut, 
  Loader2,
  LockKeyhole // 👈 Nuevo ícono para la contraseña
} from "lucide-react";

import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession, signOut } from "@/lib/auth-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge"; // Opcional, si quieres que el rol se vea como etiqueta

export function Header() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  // 👇 CORRECCIÓN AQUÍ:
  // Forzamos a TS a tratar al usuario como 'any' para poder leer propiedades extra (role)
  // Esto elimina el error rojo porque desactivamos el chequeo estricto para esta variable.
  const user = session?.user as any;

  const handleLogout = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
          toast.success("Has cerrado sesión correctamente");
        },
      },
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  // 1. DICCIONARIO DE TRADUCCIÓN DE ROLES 🗺️
  // Convertimos los códigos de la BD a texto amigable
  const roleLabels: Record<string, string> = {
    ADMIN: "Administrador",
    DOCTOR: "Médico",
    PATIENT: "Paciente",
    // Por si acaso llega en minúsculas:
    admin: "Administrador",
    doctor: "Médico",
    patient: "Paciente",
  };

  // Obtenemos el rol y lo traducimos. Si no existe, mostramos "Usuario"
  // const userRole = session?.user?.role ? (roleLabels[session.user.role] || session.user.role) : "Usuario";
  // 👇 AHORA USAMOS 'user' EN LUGAR DE 'session.user'
  const userRole = user?.role ? (roleLabels[user.role] || user.role) : "Usuario";

  return (
    <header className="w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4 md:px-6">
        
        {/* IZQUIERDA: Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg hover:opacity-80 transition-opacity">
          <Stethoscope className="h-6 w-6 text-primary" />
          <span className="hidden md:inline-block">MedTurnos</span>
        </Link>

        {/* DERECHA: Usuario y Tema */}
        <div className="flex items-center gap-4">
          
          {isPending ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : session ? (
            <div className="flex items-center gap-4">
              
              {/* 2. INFORMACIÓN VISUAL ACTUALIZADA */}
              <div className="hidden md:flex flex-col items-end text-sm">
                <span className="font-medium leading-none">{session.user.name}</span>
                {/* Aquí mostramos el ROL en lugar del email, con un color destacado */}
                <span className="text-xs font-semibold text-primary mt-1">
                  {userRole}
                </span>
              </div>

              {/* Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-9 w-9 border">
                      <AvatarImage src={session.user.image || ""} alt={session.user.name} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {getInitials(session.user.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{session.user.name}</p>
                      {/* Mantenemos el email aquí adentro para referencia */}
                      <p className="text-xs leading-none text-muted-foreground">
                        {session.user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {/* 3. NUEVA OPCIÓN: CAMBIAR CONTRASEÑA */}
                  {/* Apuntamos a una ruta que crearemos pronto */}
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/perfil" className="cursor-pointer w-full flex items-center">
                      <LockKeyhole className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>Cambiar Contraseña</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar Sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : null}

          <div className="h-6 w-px bg-border hidden md:block" />
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}

