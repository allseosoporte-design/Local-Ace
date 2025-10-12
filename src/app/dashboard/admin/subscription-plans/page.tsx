'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { PlusCircle, BarChart, CheckCircle, Star } from 'lucide-react';
import { collection, query, orderBy, where } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { PlanModal } from '@/components/plan-modal';
import type { SubscriptionPlan } from '@/types/subscription-plan';
import { PlanCard } from '@/components/plan-card';
import { useToast } from '@/hooks/use-toast';
import { deleteDoc, doc, writeBatch } from 'firebase/firestore';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function SubscriptionPlansPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [showInactive, setShowInactive] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [planToDelete, setPlanToDelete] = useState<SubscriptionPlan | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const plansQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    let q = query(collection(firestore, 'subscriptionPlans'), orderBy('order'));
    if (!showInactive) {
      q = query(q, where('isActive', '==', true));
    }
    return q;
  }, [firestore, showInactive]);

  const { data: plans, isLoading } = useCollection<SubscriptionPlan>(plansQuery);

  const metrics = useMemo(() => {
    if (!plans) return { total: 0, active: 0, popular: 0 };
    const activePlans = plans.filter(p => p.isActive);
    return {
      total: plans.length,
      active: activePlans.length,
      popular: activePlans.filter(p => p.isPopular).length,
    };
  }, [plans]);

  const handleCreate = () => {
    setEditingPlan(null);
    setIsModalOpen(true);
  };

  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setIsModalOpen(true);
  };

  const handleDeleteConfirmation = (plan: SubscriptionPlan) => {
    setPlanToDelete(plan);
    setIsAlertOpen(true);
  };
  
  const handleDelete = async () => {
    if (!planToDelete || !firestore) return;
    try {
      await deleteDoc(doc(firestore, 'subscriptionPlans', planToDelete.id));
      toast({ title: 'Plan eliminado', description: 'El plan ha sido eliminado exitosamente.' });
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo eliminar el plan.' });
    } finally {
      setIsAlertOpen(false);
      setPlanToDelete(null);
    }
  };
  
  const handleReorder = async (plan: SubscriptionPlan, direction: 'up' | 'down') => {
    if (!plans || !firestore) return;
    const currentIndex = plans.findIndex(p => p.id === plan.id);
    if (currentIndex === -1) return;

    let otherIndex = -1;
    if (direction === 'up' && currentIndex > 0) {
      otherIndex = currentIndex - 1;
    } else if (direction === 'down' && currentIndex < plans.length - 1) {
      otherIndex = currentIndex + 1;
    }
    
    if (otherIndex === -1) return;
    
    const otherPlan = plans[otherIndex];

    try {
      const batch = writeBatch(firestore);
      const planRef = doc(firestore, 'subscriptionPlans', plan.id);
      const otherPlanRef = doc(firestore, 'subscriptionPlans', otherPlan.id);

      batch.update(planRef, { order: otherPlan.order });
      batch.update(otherPlanRef, { order: plan.order });
      
      await batch.commit();
      toast({ title: 'Plan reordenado', description: 'El orden de los planes ha sido actualizado.' });
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo reordenar el plan.' });
    }
  };


  return (
    <div className="space-y-6">
       <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Gestión de Planes de Suscripción</h1>
          <p className="text-muted-foreground">
            Administra los planes que se muestran en la página principal.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Crear Plan
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Planes</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : metrics.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Planes Activos</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : metrics.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Planes Populares</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : metrics.popular}</div>
          </CardContent>
        </Card>
        <div className="flex items-center justify-center rounded-lg border bg-card text-card-foreground shadow-sm p-4">
           <div className="flex items-center space-x-2">
              <Switch id="show-inactive" checked={showInactive} onCheckedChange={setShowInactive} />
              <Label htmlFor="show-inactive">Mostrar planes inactivos</Label>
            </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading && Array.from({length: 4}).map((_, i) => <Card key={i} className="h-[250px] animate-pulse"/>)}
        {plans?.map((plan) => (
          <PlanCard 
            key={plan.id} 
            plan={plan} 
            onEdit={handleEdit} 
            onDelete={handleDeleteConfirmation} 
            onReorder={handleReorder}
          />
        ))}
      </div>
       {!isLoading && plans?.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <p>No se encontraron planes. ¡Crea el primero!</p>
          </div>
        )}

      <PlanModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        plan={editingPlan}
        planCount={plans?.length || 0}
      />
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás realmente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción es irreversible y eliminará el plan de forma permanente. 
              Cualquier usuario suscrito a este plan podría verse afectado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
