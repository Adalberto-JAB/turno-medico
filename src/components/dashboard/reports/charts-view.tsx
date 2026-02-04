"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from "recharts";
import { Loader2 } from "lucide-react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

interface Props {
  dataStatus: { name: string; value: number }[];
  dataSpecialty: { name: string; value: number }[];
  topDoctors: { name: string; appointments: number }[];
}

export function ChartsView({ dataStatus, dataSpecialty, topDoctors }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Loader con altura FORZADA por estilo (evita colapso)
  if (!mounted) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-6">
         <Card className="col-span-4 lg:col-span-3 bg-muted/10">
            <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
         </Card>
         <Card className="col-span-4 bg-muted/10">
            <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
         </Card>
      </div>
    );
  }

  // 2. Si no hay datos, mostrar aviso
  const hasData = dataStatus.length > 0 || dataSpecialty.length > 0;
  if (!hasData) {
    return (
       <div className="mt-6 p-8 text-center border rounded-lg bg-muted/20">
         <p className="text-muted-foreground">No hay datos para mostrar en los gráficos.</p>
       </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-6">
      
      {/* GRÁFICO 1: Torta */}
      <Card className="col-span-4 lg:col-span-3">
        <CardHeader>
          <CardTitle>Estado de Turnos</CardTitle>
          <CardDescription>Distribución por estado</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          {/* 🔥 SOLUCIÓN FINAL: Estilo en línea para forzar la altura */}
          <div style={{ width: '100%', height: '400px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent = 0 }) => percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dataStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* GRÁFICO 2: Barras */}
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Demanda por Especialidad</CardTitle>
          <CardDescription>Turnos por área médica</CardDescription>
        </CardHeader>
        <CardContent>
          {/* 🔥 SOLUCIÓN FINAL: Estilo en línea */}
          <div style={{ width: '100%', height: '400px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataSpecialty} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                    dataKey="name" 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    angle={-45} // Rotamos texto por si es largo
                    textAnchor="end"
                    height={60}
                />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Turnos" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* RANKING (Este ya funcionaba, solo mantenemos el estilo limpio) */}
      <Card className="col-span-4 lg:col-span-7">
        <CardHeader>
          <CardTitle>Ranking de Profesionales</CardTitle>
          <CardDescription>Top 5 médicos con más consultas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {topDoctors.map((doc, index) => (
              <div key={index} className="flex items-center">
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 font-bold text-sm text-slate-700 dark:text-slate-300 mr-4">
                  #{index + 1}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">{doc.name}</p>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 mt-1 overflow-hidden">
                    <div 
                        className="bg-primary h-2.5 rounded-full transition-all duration-500" 
                        style={{ width: `${(doc.appointments / (topDoctors[0]?.appointments || 1)) * 100}%` }} 
                    />
                  </div>
                </div>
                <div className="font-medium text-sm ml-4 min-w-12 text-right">
                  {doc.appointments} <span className="text-xs text-muted-foreground font-normal">citas</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}