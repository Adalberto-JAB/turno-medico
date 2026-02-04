import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Shield, Clock, ArrowRight, Stethoscope, CheckCircle2 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* 1. HERO SECTION */}
      <section className="flex-1 flex flex-col items-center justify-center space-y-10 py-24 px-4 text-center md:py-32 bg-linear-to-b from-background to-muted/20">
        
        {/* Badge / Etiqueta */}
        <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium bg-muted text-muted-foreground backdrop-blur-sm">
          <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2"></span>
          Sistema de Gestión v1.0
        </div>

        {/* Títulos */}
        <div className="space-y-4 max-w-3xl">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Salud y Tecnología <br className="hidden sm:inline" />
            <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300">
              en perfecta sincronía
            </span>
          </h1>
          <p className="mx-auto max-w-175 text-muted-foreground md:text-xl">
            Gestiona tus turnos médicos, accede a tu historial y conecta con los mejores profesionales. Rápido, seguro y accesible.
          </p>
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link href="/register">
            <Button size="lg" className="w-full sm:w-auto gap-2 text-base h-12 px-8">
              Crear mi cuenta <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-base h-12 px-8">
              Ya tengo cuenta
            </Button>
          </Link>
        </div>
      </section>

      {/* 2. FEATURES GRID */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <Card className="bg-card/50 border-muted/60 shadow-sm hover:shadow-md transition-all">
            <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold">Turnos al Instante</h3>
              <p className="text-muted-foreground">
                Olvídate de las llamadas. Agenda tu cita médica en segundos, las 24 horas del día.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-muted/60 shadow-sm hover:shadow-md transition-all">
            <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <Shield className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold">Datos Seguros</h3>
              <p className="text-muted-foreground">
                Tu información médica y personal está encriptada y protegida con los más altos estándares.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-muted/60 shadow-sm hover:shadow-md transition-all">
            <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <Stethoscope className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-bold">Profesionales Top</h3>
              <p className="text-muted-foreground">
                Accede a una cartilla de médicos especialistas verificados y calificados.
              </p>
            </CardContent>
          </Card>

        </div>
      </section>

      {/* 3. SOCIAL PROOF / TRUST */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4 text-center space-y-8">
          <h2 className="text-2xl font-bold tracking-tight">
            Confían en nosotros
          </h2>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-70 grayscale transition-all hover:grayscale-0">
            {/* Logos ficticios de clínicas (Texto simple por ahora) */}
            <div className="flex items-center gap-2 font-semibold text-xl">
               <div className="h-8 w-8 bg-primary rounded-full" /> Clínica Del Valle
            </div>
            <div className="flex items-center gap-2 font-semibold text-xl">
               <div className="h-8 w-8 bg-blue-500 rounded-full" /> Salud Total
            </div>
            <div className="flex items-center gap-2 font-semibold text-xl">
               <div className="h-8 w-8 bg-red-500 rounded-full" /> MediLife
            </div>
          </div>
        </div>
      </section>

      {/* 4. CTA FINAL */}
      <section className="py-24 px-4 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold">¿Listo para empezar?</h2>
          <p className="text-muted-foreground">
            Únete a los más de 200 pacientes que ya gestionan su salud con MedTurnos.
          </p>
          <Link href="/register">
             <Button size="lg" className="rounded-full px-8">Comenzar Gratis</Button>
          </Link>
        </div>
      </section>

    </div>
  );
}