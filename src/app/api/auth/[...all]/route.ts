import { auth } from "@/lib/auth"; // Importamos la config del servidor
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);

    