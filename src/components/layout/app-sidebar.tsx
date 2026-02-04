"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  CalendarDays, 
  Users, 
  Stethoscope, 
  PlusCircle, 
  UserCog, 
  Clock, 
  FileText, 
  Menu,
  CalendarCheck
} from "lucide-react";
import { useSession } from "@/lib/auth-client"; 
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger, 
  SheetTitle,        
  SheetDescription   
} from "@/components/ui/sheet";

// Configuración centralizada de Menú (Single Source of Truth)
const MENU_CONFIG = [
  {
    header: "General",
    items: [
      { 
        label: "Inicio", 
        href: "/dashboard", 
        icon: LayoutDashboard, 
        roles: ["ADMIN", "DOCTOR", "PATIENT"] 
      },
    ]
  },
  {
    header: "Administración",
    items: [
      { label: "Médicos", href: "/dashboard/medicos", icon: Stethoscope, roles: ["ADMIN"] },
      { label: "Pacientes", href: "/dashboard/pacientes", icon: Users, roles: ["ADMIN"] },
      { label: "Gestión de Turnos", href: "/dashboard/turnos", icon: CalendarCheck, roles: ["ADMIN"] },
      { label: "Reportes", href: "/dashboard/reportes", icon: FileText, roles: ["ADMIN"] },
    ]
  },
  {
    header: "Consultorio",
    items: [
      { label: "Mi Agenda", href: "/dashboard/medico", icon: UserCog, roles: ["DOCTOR"] },
      { label: "Historiales", href: "/dashboard/medico/historiales", icon: FileText, roles: ["DOCTOR"] },
    ]
  },
  {
    header: "Mis Turnos",
    items: [
      { label: "Próximos Turnos", href: "/dashboard/mis-turnos", icon: Clock, roles: ["PATIENT"] },
      { label: "Nuevo Turno", href: "/dashboard/turnos/crear", icon: PlusCircle, roles: ["PATIENT"] },
    ]
  }
];

export function AppSidebar({ className }: React.HTMLAttributes<HTMLDivElement>) {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  // 🟢 CORRECCIÓN DE TIPO: Hacemos un cast seguro
  const user = session?.user as { role?: "ADMIN" | "DOCTOR" | "PATIENT" } | undefined;
  const role = user?.role || "GUEST";

  return (
    <div className={cn("pb-12 min-h-screen bg-slate-900", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <Link href="/dashboard" className="flex items-center pl-3 mb-6">
             <Stethoscope className="mr-2 h-6 w-6 text-white" />
             <h2 className="text-lg font-semibold tracking-tight text-white">
               MedTurnos
             </h2>
          </Link>
          
          <div className="space-y-1">
            {MENU_CONFIG.map((group, groupIndex) => {
              // Filtramos los items según el rol
              const visibleItems = group.items.filter(item => item.roles.includes(role));
              
              if (visibleItems.length === 0) return null;

              return (
                <div key={groupIndex} className="py-2">
                  <h3 className="mb-1 px-4 text-xs font-semibold uppercase text-slate-400">
                    {group.header}
                  </h3>
                  {visibleItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-800 hover:text-white",
                        pathname === item.href ? "bg-slate-800 text-white" : "text-slate-400"
                      )}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </Link>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// 🟢 RESTAURACIÓN: Componente MobileSidebar (Esto es lo que faltaba y rompía el layout)
export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu />
        </Button>
      </SheetTrigger>
      
      <SheetContent side="left" className="p-0 bg-slate-900 border-none w-72 text-white">
        <SheetTitle className="sr-only">Menú de Navegación</SheetTitle>
        <SheetDescription className="sr-only">
          Opciones de navegación del sistema
        </SheetDescription>

        {/* Reutilizamos el componente AppSidebar dentro del Sheet */}
        <AppSidebar />
      </SheetContent>
    </Sheet>
  );
}