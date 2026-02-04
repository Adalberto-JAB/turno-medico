"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Loader2, Clock, AlertCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Props {
  slots: string[];
  selectedTime: string | undefined;
  onSelectTime: (time: string) => void;
  isLoading: boolean;
  error: string | null;
}

export function TimeSlots({ slots, selectedTime, onSelectTime, isLoading, error }: Props) {
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground space-y-2 border rounded-md border-dashed">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm">Buscando huecos disponibles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 text-red-600 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200">
        <AlertCircle className="h-5 w-5" />
        <p className="text-sm font-medium">{error}</p>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground space-y-2 border rounded-md border-dashed bg-muted/20">
        <Clock className="h-8 w-8 opacity-20" />
        <p className="text-sm font-medium">No hay turnos disponibles.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-xs text-muted-foreground font-medium mb-2">
        {slots.length} horarios encontrados:
      </div>
      
      <ScrollArea className="h-50 pr-4">
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {slots.map((time) => (
            <Button
              key={time}
              type="button"
              variant={selectedTime === time ? "default" : "outline"}
              className={cn(
                "w-full transition-all duration-200",
                selectedTime === time 
                  ? "bg-primary text-primary-foreground shadow-md scale-105" 
                  : "hover:border-primary/50"
              )}
              onClick={() => onSelectTime(time)}
            >
              {time}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}