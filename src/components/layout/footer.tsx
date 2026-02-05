export function Footer() {
  return (
    <footer className="w-full border-t bg-muted/40 py-6">
      <div className="container flex flex-col items-center justify-between gap-4 px-4 md:px-6 md:flex-row text-center md:text-left">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Sistema de Gestión de Turnos.
        </p>
        <div className="text-sm text-muted-foreground">
          Desarrollado con Next.js 16 & Prisma
        </div>
      </div>
    </footer>
  )
}