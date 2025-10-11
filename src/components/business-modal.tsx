"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const businessSchema = z.object({
  name: z.string().min(1, { message: "El nombre del negocio es requerido." }),
  adminEmail: z.string().email({ message: "Por favor, introduce un correo válido." }),
  status: z.enum(["Active", "Suspended"], {
    required_error: "El estado es requerido.",
  }),
});

export type BusinessFormData = z.infer<typeof businessSchema>;

type Business = {
  id: string;
  name: string;
  adminEmail: string;
  status: "Active" | "Suspended";
};

interface BusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: BusinessFormData) => void;
  business: Business | null;
}

export function BusinessModal({ isOpen, onClose, onSave, business }: BusinessModalProps) {
  const form = useForm<BusinessFormData>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      name: "",
      adminEmail: "",
      status: "Active",
    },
  });

  useEffect(() => {
    if (business) {
      form.reset(business);
    } else {
      form.reset({
        name: "",
        adminEmail: "",
        status: "Active",
      });
    }
  }, [business, form, isOpen]);

  const onSubmit = (data: BusinessFormData) => {
    onSave(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{business ? "Editar Negocio" : "Crear Nuevo Negocio"}</DialogTitle>
          <DialogDescription>
            {business ? "Actualiza los detalles del negocio." : "Rellena los campos para crear un nuevo negocio."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Negocio</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Café La Esquina" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="adminEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo del Administrador</FormLabel>
                  <FormControl>
                    <Input placeholder="admin@ejemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Active">Activo</SelectItem>
                      <SelectItem value="Suspended">Suspendido</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
              <Button type="submit">Guardar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
