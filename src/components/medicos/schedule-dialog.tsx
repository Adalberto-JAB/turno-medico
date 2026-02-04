"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CalendarClock } from "lucide-react";
import { ScheduleForm } from "./schedule-form"; // Reutilizamos tu formulario existente

interface Schedule {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

interface Props {
  doctorId: string;
  doctorName: string;
  existingSchedule: Schedule[];
}

export function ScheduleDialog({ doctorId, doctorName, existingSchedule }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" title="Gestionar Horarios">
          <CalendarClock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="sr-only">Agenda</span>
        </Button>
      </DialogTrigger>
      
      {/* max-w-3xl para que sea ancho y cómodo */}
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agenda: {doctorName}</DialogTitle>
          <DialogDescription>
            Configura los días y franjas horarias en las que atiende este profesional.
          </DialogDescription>
        </DialogHeader>

        {/* Invocamos tu formulario Maestro */}
        <div className="mt-2">
           <ScheduleForm 
              doctorId={doctorId} 
              initialSchedule={existingSchedule} 
           />
        </div>
        
      </DialogContent>
    </Dialog>
  );
}