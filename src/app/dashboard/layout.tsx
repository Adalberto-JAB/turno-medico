import { AppSidebar, MobileSidebar } from "@/components/layout/app-sidebar";
import { Header } from "@/components/layout/header"; // 👈 Recuperamos el Header
import { Footer } from "@/components/layout/footer"; // 👈 Recuperamos el Footer

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* 1. Sidebar Desktop (Fijo a la izquierda) */}
      <aside className="hidden md:flex w-72 flex-col fixed inset-y-0 z-50 border-r bg-slate-900">
        <AppSidebar />
      </aside>

      {/* 2. Área Principal (A la derecha del Sidebar) */}
      <div className="flex flex-col flex-1 md:pl-72 transition-all duration-300 min-h-screen">
        
        {/* A. Header Global (Con el botón de Tema funcionando) */}
        {/* Nota: En móvil, mostramos el botón hamburguesa DENTRO del Header o justo debajo.
            Para mantener el Header limpio, pondremos el MobileSidebar aquí si es móvil. */}
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b">
            <div className="flex items-center px-4 md:px-0">
                {/* Botón Hamburguesa (Solo Móvil) */}
                <div className="md:hidden mr-2">
                    <MobileSidebar />
                </div>
                {/* El Header original ocupa el resto */}
                <div className="flex-1">
                    <Header />
                </div>
            </div>
        </div>

        {/* B. Contenido de la Página (Scrollable) */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>

        {/* C. Footer Global */}
        <Footer />
      </div>
    </div>
  );
}

