import { createAuthClient } from "better-auth/react";
// import type { auth } from "./auth"; // 👈 Importamos SOLO EL TIPO del servidor

//export const authClient = createAuthClient<typeof auth>({ // 👈 Inyectamos el tipo aquí
export const authClient = createAuthClient({ 
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
});

export const { 
  signIn, 
  signUp, 
  signOut, 
  useSession, 
  getSession 
} = authClient;