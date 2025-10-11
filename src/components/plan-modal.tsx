'use client';

import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import type { SubscriptionPlan } from '@/types/subscription-plan';
import { useFirestore } from '@/firebase';
import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { X } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

const planSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres.'),
  price: z.coerce.number().positive('El precio debe ser un número positivo.'),
  currency: z.string().default('COP'),
  billingPeriod: z.enum(['monthly', 'yearly']),
  features: z.array(z.string().min(3, 'Cada característica debe tener al menos 3 caracteres.')).min(1, 'Debe haber al menos una característica.'),
  order: z.coerce.number().int().min(0, 'El orden debe ser un número positivo.'),
  isActive: z.boolean().default(true),
  isPopular: z.boolean().default(false),
});

type PlanFormData = z.infer<typeof planSchema>;

interface PlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: SubscriptionPlan | null;
  planCount: number;
}

export function PlanModal({ isOpen, onClose, plan, planCount }: PlanModalProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const form = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      currency: 'COP',
      billingPeriod: 'monthly',
      features: [''],
      order: 0,
      isActive: true,
      isPopular: false,
    },
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'features',
  });

  useEffect(() => {
    if (isOpen) {
      if (plan) {
        form.reset({
          ...plan,
          features: plan.features.length > 0 ? plan.features : [''],
        });
      } else {
        form.reset({
          name: '',
          description: '',
          price: 0,
          currency: 'COP',
          billingPeriod: 'monthly',
          features: [''],
          order: planCount,
          isActive: true,
          isPopular: false,
        });
      }
    }
  }, [plan, isOpen, form, planCount]);

  const onSubmit = async (data: PlanFormData) => {
    if (!firestore) return;
    try {
      if (plan) {
        // Update
        const planRef = doc(firestore, 'subscriptionPlans', plan.id);
        await setDoc(planRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
        toast({ title: 'Plan actualizado', description: 'Los cambios han sido guardados.' });
      } else {
        // Create
        await addDoc(collection(firestore, 'subscriptionPlans'), {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        toast({ title: 'Plan creado', description: 'El nuevo plan ha sido añadido.' });
      }
      onClose();
    } catch (error) {
       console.error(error);
       toast({ variant: 'destructive', title: 'Error', description: 'No se pudo guardar el plan.' });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{plan ? 'Editar Plan de Suscripción' : 'Crear Nuevo Plan'}</DialogTitle>
          <DialogDescription>
            {plan ? 'Actualiza los detalles del plan.' : 'Rellena los campos para crear un nuevo plan de suscripción.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ScrollArea className="h-[60vh] pr-6">
              <div className="space-y-4 py-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem>
                          <FormLabel>Nombre del Plan</FormLabel>
                          <FormControl><Input placeholder="Ej: Básico" {...field} /></FormControl>
                          <FormMessage />
                      </FormItem>
                  )}/>
                   <FormField control={form.control} name="description" render={({ field }) => (
                      <FormItem>
                          <FormLabel>Descripción</FormLabel>
                          <FormControl><Textarea placeholder="Describe el plan..." {...field} /></FormControl>
                          <FormMessage />
                      </FormItem>
                  )}/>
                  <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="price" render={({ field }) => (
                          <FormItem>
                              <FormLabel>Precio</FormLabel>
                              <FormControl><Input type="number" placeholder="99000" {...field} /></FormControl>
                              <FormMessage />
                          </FormItem>
                      )}/>
                      <FormField control={form.control} name="currency" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Moneda</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="COP">COP</SelectItem>
                                    <SelectItem value="USD">USD</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                      )}/>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="billingPeriod" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Período de Facturación</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="monthly">Mensual</SelectItem>
                                    <SelectItem value="yearly">Anual</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                      )}/>
                      <FormField control={form.control} name="order" render={({ field }) => (
                          <FormItem>
                              <FormLabel>Orden</FormLabel>
                              <FormControl><Input type="number" placeholder="0" {...field} /></FormControl>
                              <FormMessage />
                          </FormItem>
                      )}/>
                  </div>

                  <div>
                      <FormLabel>Características</FormLabel>
                      <div className="space-y-2 pt-2">
                        {fields.map((field, index) => (
                           <FormField
                              key={field.id}
                              control={form.control}
                              name={`features.${index}`}
                              render={({ field }) => (
                                <FormItem>
                                  <div className="flex items-center gap-2">
                                      <FormControl>
                                          <Input placeholder={`Característica ${index + 1}`} {...field} />
                                      </FormControl>
                                      {fields.length > 1 && (
                                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                            <X className="h-4 w-4 text-destructive" />
                                        </Button>
                                      )}
                                  </div>
                                   <FormMessage />
                                </FormItem>
                              )}
                            />
                        ))}
                      </div>
                      <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append('')}>Añadir Característica</Button>
                  </div>
                  <div className="flex items-center space-x-4 pt-4">
                     <FormField control={form.control} name="isActive" render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm w-full">
                            <div className="space-y-0.5"><FormLabel>Activo</FormLabel></div>
                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        </FormItem>
                      )}/>
                      <FormField control={form.control} name="isPopular" render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm w-full">
                            <div className="space-y-0.5"><FormLabel>Popular</FormLabel></div>
                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        </FormItem>
                      )}/>
                  </div>
              </div>
            </ScrollArea>
             <DialogFooter className="pt-4 border-t">
              <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
              <Button type="submit">Guardar Plan</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
