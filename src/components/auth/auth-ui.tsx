"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Control } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// 1. EL CONTENEDOR (CARD)
interface AuthCardProps {
  title: string;
  description: string;
  footerText: string;
  footerLinkText: string;
  footerLinkHref: string;
  children: React.ReactNode;
}

export function AuthCard({ title, description, footerText, footerLinkText, footerLinkHref, children }: AuthCardProps) {
  return (
    <Card className="w-full max-w-md border-muted/50 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">{title}</CardTitle>
        <CardDescription className="text-center">{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          {footerText}{" "}
          <Link href={footerLinkHref} className="text-primary hover:underline font-medium">
            {footerLinkText}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

// 2. EL INPUT REUTILIZABLE
interface AuthInputProps {
  control: Control<any>;
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
}

export function AuthInput({ control, name, label, placeholder, type = "text" }: AuthInputProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input type={type} placeholder={placeholder} {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// 3. EL BOTÓN DE SUBMIT
export function SubmitButton({ loading, text }: { loading: boolean; text: string }) {
  return (
    <Button type="submit" className="w-full mt-2" disabled={loading}>
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {loading ? "Procesando..." : text}
    </Button>
  );
}