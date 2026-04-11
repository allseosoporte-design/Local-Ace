
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { PlusCircle, BarChart, CheckCircle, Star, Loader2, ShieldAlert, RefreshCw } from 'lucide-react';
import { collection, query, doc, writeBatch, deleteDoc, addDoc, updateDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { useFirestore, useCollection, useUser } from '@/firebase';
import { PlanModal, type PlanFormData } from '@/components/plan-modal';
import type { SubscriptionPlan } from '@/types/subscription-plan';
import { PlanCard } from '@/components/plan-card';
import { useToast } from '@/hooks/use-toast';
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
import { getIdTokenResult } from 'firebase/auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

/**
 * SubscriptionPlansPage - Professional management of SaaS tiers.
 * Optimized for production with fresh token validation and DB persistence.
 */
export default function SubscriptionPlansPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  
  const [showInactive, setShowInactive] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [planToDelete, setPlanToDelete] = useState<SubscriptionPlan | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  
  // Admin State Diagnostics
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // EFECTO CRÍTICO: Validar permisos reales en Firestore
  useEffect(() => {
    const checkAdmin = async () => {
      if (user) {
        try {
          // Forzamos actualización para obtener los últimos Custom Claims
          const tokenResult = await getIdTokenResult(user, true);
          const claims = tokenResult.claims;
          
          if (claims.isSuperAdmin === true) {
            setIsSuperAdmin(true);
            setAuthError(null);
          } else {
            setIsSuperAdmin(false);
            setAuthError("Tu sesión no tiene permisos de escritura. Si acabas de ser asignado como admin, por favor cierra sesión y vuelve a entrar.");
          }
        } catch (error: any) {
          console.error("Auth Error:", error);
          setAuthError(`Error de validación: ${error.message}`);
        } finally {
          setIsCheckingAdmin(false);
        }
      } else if (!isUserLoading) {
         setIsCheckingAdmin(false);
      }
    };
    checkAdmin();
  }, [user, isUserLoading]);

  const plansQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'subscriptionPlans'), orderBy('order', 'asc'));
  }, [firestore]);

  const { data: allPlans, isLoading: isLoadingPlans, forceUpdate } = useCollection<SubscriptionPlan>(plansQuery);

  const plans = useMemo(() => {
    if (!allPlans) return [];
    let filteredPlans = allPlans;
    if (!showInactive) {
      filteredPlans = filteredPlans.filter(p => p.isActive);
    }
    return filteredPlans.sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [allPlans, showInactive]);

  const metrics = useMemo(() => {
    if (!allPlans) return { total: 0, active: 0, popular: 0 };
    const activePlans = allPlans.filter(p => p.isActive);
    return {
      total: allPlans.length,
      active: activePlans.length,
      popular: activePlans.filter(p => p.isPopular).length,
    };
  }, [allPlans]);

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
      toast({ title: 'Plan eliminado', description: 'Los cambios se han persistido en la base de datos.' });
    } catch (error: any) {
      console.error(error);
      const message = error.code === 'permission-denied' 
        ? "Firestore rechazó la eliminación por falta de permisos de Super Admin." 
        : error.message;
      toast({ variant: 'destructive', title: 'Error al eliminar', description: message });
    } finally {
      setIsAlertOpen(false);
      setPlanToDelete(null);
    }
  };
  
  const handleSave = async (data: PlanFormData) => {
    if (!firestore) return;
    try {
      if (editingPlan) {
        const planRef = doc(firestore, 'subscriptionPlans', editingPlan.id);
        await updateDoc(planRef, { ...data, updatedAt: serverTimestamp() });
        toast({ title: '¡Plan Actualizado!', description: 'Los cambios están ahora en la base de datos.' });
      } else {
        await addDoc(collection(firestore, 'subscriptionPlans'), {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        toast({ title: '¡Plan Creado!', description: 'Se ha guardado el nuevo nivel de suscripción.' });
      }
      setIsModalOpen(false);
    } catch (error: any) {
       console.error("Save Error:", error);
       const message = error.code === 'permission-denied' 
        ? "No tienes permiso para escribir en la base de datos. Verifica tu rol de Super Admin." 
        : error.message;
       toast({ variant: 'destructive', title: 'Error al guardar', description: message });
    }
  };

  const handleReorder = async (plan: SubscriptionPlan, direction: 'up' | 'down') => {
    if (!plans || !firestore) return;
    const sortedPlans = [...plans].sort((a, b) => (a.order || 0) - (b.order || 0));
    const currentIndex = sortedPlans.findIndex(p => p.id === plan.id);
    
    if (currentIndex === -1) return;

    let otherIndex = -1;
    if (direction === 'up' && currentIndex > 0) {
      otherIndex = currentIndex - 1;
    } else if (direction === 'down' && currentIndex < sortedPlans.length - 1) {
      otherIndex = currentIndex + 1;
    }
    
    if (otherIndex === -1) return;
    
    const otherPlan = sortedPlans[otherIndex];

    try {
      const batch = writeBatch(firestore);
      const planRef = doc(firestore, 'subscriptionPlans', plan.id);
      const otherPlanRef = doc(firestore, 'subscriptionPlans', otherPlan.id);

      batch.update(planRef, { order: otherPlan.order });
      batch.update(otherPlanRef, { order: plan.order });
      
      await batch.commit();
      toast({ title: 'Orden actualizado', description: 'Se ha sincronizado la posición de los planes.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error de reordenamiento', description: error.message });
    }
  };

  const handleRefresh = () => {
    if (forceUpdate) forceUpdate();
    toast({ title: "Sincronizando...", description: "Cargando datos frescos desde Firestore." });
  };

  const showLoading = isUserLoading || isCheckingAdmin || isLoadingPlans;

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Gestión de Planes de Suscripción</h1>
            <p className="text-muted-foreground">
              Configuración dinámica vinculada a la base de datos de producción.
            </p>
          </div>
          <div className='flex gap-2'>
            <Button variant="outline" size="icon" onClick={handleRefresh} disabled={showLoading}>
                <RefreshCw className={showLoading ? 'animate-spin' : ''} />
            </Button>
            <Button onClick={handleCreate} disabled={!isSuperAdmin || showLoading}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Crear Plan
            </Button>
          </div>
        </div>

        {authError && !showLoading && (
          <Alert variant="destructive" className="bg-red-50 border-red-200">
            <ShieldAlert className="h-4 w-4 text-red-600" />
            <AlertTitle className='text-red-800 font-bold'>Advertencia de Permisos</AlertTitle>
            <AlertDescription className='text-red-700'>
              {authError}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Planes</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{showLoading ? '...' : metrics.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Planes Activos</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{showLoading ? '...' : metrics.active}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Planes Populares</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{showLoading ? '...' : metrics.popular}</div>
            </CardContent>
          </Card>
          <div className="flex items-center justify-center rounded-lg border bg-card text-card-foreground shadow-sm p-4">
            <div className="flex items-center space-x-2">
                <Switch id="show-inactive" checked={showInactive} onCheckedChange={setShowInactive} />
                <Label htmlFor="show-inactive">Mostrar inactivos</Label>
              </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {showLoading && Array.from({length: 4}).map((_, i) => (
            <Card key={i} className="h-[400px] flex flex-col">
              <CardHeader><Skeleton className="h-5 w-2/4" /><Skeleton className="h-4 w-full mt-2" /></CardHeader>
              <CardContent className="flex-grow"><Skeleton className="h-8 w-1/3 mb-4" /><Skeleton className="h-px w-full" /></CardContent>
              <CardFooter><Skeleton className="h-10 w-full" /></CardFooter>
            </Card>
          ))}
          {!showLoading && isSuperAdmin && plans?.map((plan) => (
            <PlanCard 
              key={plan.id} 
              plan={plan} 
              onEdit={handleEdit} 
              onDelete={handleDeleteConfirmation} 
              onReorder={handleReorder}
            />
          ))}
        </div>
        
        {!showLoading && (!isSuperAdmin || (plans?.length === 0)) && !authError && (
            <div className="col-span-full text-center py-16 bg-muted/20 rounded-xl border border-dashed">
              <p className='text-muted-foreground'>No hay planes disponibles en la base de datos. Comienza creando uno nuevo.</p>
            </div>
          )}
      </div>

      <PlanModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        plan={editingPlan}
        planCount={allPlans?.length || 0}
      />
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción borrará el plan permanentemente de la base de datos de Firestore.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Eliminar permanentemente</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
