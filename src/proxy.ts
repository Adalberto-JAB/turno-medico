import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { betterFetch } from "@better-fetch/fetch";

type AuthResponse = {
  session: {
    id: string;
    expiresAt: Date;
    ipAddress?: string;
    userAgent?: string;
    userId: string;
  };
  user: {
    id: string;
    email: string;
    name: string;
    image?: string | null;
    role: string;
  };
};

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  const { data, error } = await betterFetch<AuthResponse>(
    "/api/auth/get-session",
    {
      baseURL: request.nextUrl.origin,
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    }
  );

  if (!data || error) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const role = data.user?.role;

  if (!role) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // --- REGLAS DE ACCESO ---

  // 1. Rutas de Admin (medicos, pacientes, usuarios)
  const isAdminRoute = 
    pathname.startsWith("/dashboard/medicos") || 
    pathname.startsWith("/dashboard/pacientes") ||
    pathname.startsWith("/dashboard/usuarios");

  if (isAdminRoute) {
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // 2. Rutas de Doctor (medico, agenda)
  // 🟢 CORRECCIÓN: Usamos regex o validación estricta para no confundir "medico" con "medicos"
  // Esta lógica dice: Es ruta doctor SI es exactamente "/dashboard/medico" O empieza con "/dashboard/medico/" (con barra)
  const isDoctorRoute = pathname === "/dashboard/medico" || pathname.startsWith("/dashboard/medico/");

  if (isDoctorRoute) {
    if (role !== "DOCTOR") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // 3. Rutas de Paciente
  if (pathname.startsWith("/dashboard/mis-turnos") || pathname.startsWith("/dashboard/nuevo-turno")) {
    if (role !== "PATIENT") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};