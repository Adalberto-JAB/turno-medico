"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Save, Plus, Trash2, Clock } from "lucide-react";
import { toast } from "sonner";
import { updateDoctorSchedule } from "@/actions/doctor-schedule";

const DAYS = [
  "Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"
];

const TIME_OPTIONS = Array.from({ length: 48 }).map((_, i) => {
  const hour = Math.floor(i / 2).toString().padStart(2, "0");
  const minute = i % 2 === 0 ? "00" : "30";
  return `${hour}:${minute}`;
});

interface TimeRange {
  startTime: string;
  endTime: string;
}

interface DayScheduleState {
  dayOfWeek: number;
  isActive: boolean;
  ranges: TimeRange[];
}

interface Props {
  doctorId: string;
  initialSchedule: { dayOfWeek: number; startTime: string; endTime: string }[];
}

export function ScheduleForm({ doctorId, initialSchedule }: Props) {
  const [loading, setLoading] = useState(false);

  const [schedule, setSchedule] = useState<DayScheduleState[]>(() => {
    return DAYS.map((_, dayIndex) => {
      const existingRanges = initialSchedule.filter(s => s.dayOfWeek === dayIndex);
      const hasRanges = existingRanges.length > 0;

      return {
        dayOfWeek: dayIndex,
        isActive: hasRanges,
        ranges: hasRanges 
          ? existingRanges.map(r => ({ startTime: r.startTime, endTime: r.endTime }))
          : [{ startTime: "09:00", endTime: "17:00" }]
      };
    });
  });

  const handleToggleDay = (dayIndex: number) => {
    setSchedule(prev => prev.map(day => 
      day.dayOfWeek === dayIndex ? { ...day, isActive: !day.isActive } : day
    ));
  };

  const addRange = (dayIndex: number) => {
    setSchedule(prev => prev.map(day => {
      if (day.dayOfWeek !== dayIndex) return day;
      return {
        ...day,
        ranges: [...day.ranges, { startTime: "18:00", endTime: "21:00" }]
      };
    }));
  };

  const removeRange = (dayIndex: number, rangeIndex: number) => {
    setSchedule(prev => prev.map(day => {
      if (day.dayOfWeek !== dayIndex) return day;
      if (day.ranges.length === 1) return day; 
      
      return {
        ...day,
        ranges: day.ranges.filter((_, i) => i !== rangeIndex)
      };
    }));
  };

  const updateTime = (dayIndex: number, rangeIndex: number, field: keyof TimeRange, value: string) => {
    setSchedule(prev => prev.map(day => {
      if (day.dayOfWeek !== dayIndex) return day;
      const newRanges = [...day.ranges];
      newRanges[rangeIndex] = { ...newRanges[rangeIndex], [field]: value };
      return { ...day, ranges: newRanges };
    }));
  };

  const onSave = async () => {
    setLoading(true);
    try {
      const flatSchedules = schedule
        .filter(day => day.isActive)
        .flatMap(day =>              
          day.ranges.map(range => ({
            dayOfWeek: day.dayOfWeek,
            startTime: range.startTime,
            endTime: range.endTime
          }))
        );

      const res = await updateDoctorSchedule(doctorId, flatSchedules);

      if (res.error) {
        toast.error(res.error, { duration: 5000 });
      } else {
        toast.success("Agenda actualizada correctamente");
      }
    } catch (error) {
      toast.error("Error desconocido al guardar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 border rounded-lg p-6 bg-card">
      {/* 🟢 CORRECCIÓN 1: Agregado gap-4 para separar texto del botón */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-medium">Horarios de Atención</h3>
          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
             <Clock className="h-3 w-3" />
             Configura los turnos en intervalos de 30 minutos.
          </p>
        </div>
        <Button onClick={onSave} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" />
          Guardar Cambios
        </Button>
      </div>

      <div className="space-y-4">
        {schedule.map((day) => (
          <div key={day.dayOfWeek} className={`p-4 border rounded-md transition-all ${day.isActive ? "bg-card" : "bg-muted/30"}`}>
            
            <div className="flex items-start gap-4">
              <div className="flex items-center space-x-2 mt-2 w-32 shrink-0">
                <Switch 
                  checked={day.isActive} 
                  onCheckedChange={() => handleToggleDay(day.dayOfWeek)}
                />
                <Label className={day.isActive ? "font-semibold" : "text-muted-foreground"}>
                  {DAYS[day.dayOfWeek]}
                </Label>
              </div>

              <div className="flex-1 space-y-3">
                {day.isActive ? (
                  <>
                    {day.ranges.map((range, index) => (
                      /* 🟢 CORRECCIÓN 2: Eliminado wrapper interno y flex-wrap para alineación correcta */
                      <div key={index} className="flex items-center gap-2">
                        
                        {/* SELECTOR HORA INICIO */}
                        <Select 
                          value={range.startTime} 
                          onValueChange={(val) => updateTime(day.dayOfWeek, index, "startTime", val)}
                        >
                          <SelectTrigger className="w-22.5">
                            <SelectValue placeholder="Inicio" />
                          </SelectTrigger>
                          <SelectContent position="popper" className="h-50">
                            {TIME_OPTIONS.map((time) => (
                              <SelectItem key={`start-${time}`} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <span className="text-muted-foreground">-</span>

                        {/* SELECTOR HORA FIN */}
                        <Select 
                          value={range.endTime} 
                          onValueChange={(val) => updateTime(day.dayOfWeek, index, "endTime", val)}
                        >
                          <SelectTrigger className="w-22.5">
                            <SelectValue placeholder="Fin" />
                          </SelectTrigger>
                          <SelectContent position="popper" className="h-50">
                            {TIME_OPTIONS.map((time) => (
                              <SelectItem key={`end-${time}`} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive/90"
                          disabled={day.ranges.length === 1}
                          onClick={() => removeRange(day.dayOfWeek, index)}
                          title="Eliminar rango"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => addRange(day.dayOfWeek)}
                      className="mt-1 text-xs"
                    >
                      <Plus className="mr-2 h-3 w-3" />
                      Agregar turno cortado
                    </Button>
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground italic py-2">
                    No laborable
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}