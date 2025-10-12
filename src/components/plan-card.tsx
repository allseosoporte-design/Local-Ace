'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ArrowUp,
  ArrowDown,
  Star,
  Pencil,
  Trash2,
  List,
} from 'lucide-react';
import type { SubscriptionPlan } from '@/types/subscription-plan';
import { useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface PlanCardProps {
  plan: SubscriptionPlan;
  onEdit: (plan: SubscriptionPlan) => void;
  onDelete: (plan: SubscriptionPlan) => void;
  onReorder: (plan: SubscriptionPlan, direction: 'up' | 'down') => void;
}

export function PlanCard({ plan, onEdit, onDelete, onReorder }: PlanCardProps) {
  const firestore = useFirestore();
  const { toast } = useToast();

  const togglePopular = async () => {
    if (!firestore) return;
    try {
      const planRef = doc(firestore, 'subscriptionPlans', plan.id);
      await updateDoc(planRef, { isPopular: !plan.isPopular });
      toast({
        title: 'Estado de popularidad cambiado',
        description: `El plan "${plan.name}" ha sido actualizado.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo cambiar el estado de popularidad.',
      });
    }
  };

  return (
    <Card className={cn("flex flex-col", !plan.isActive && "bg-muted/50")}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{plan.name}</CardTitle>
          <div className="flex items-center gap-2">
            {plan.isPopular && <Badge>Popular</Badge>}
            {!plan.isActive && <Badge variant="destructive">Inactivo</Badge>}
          </div>
        </div>
        <CardDescription className="h-10">{plan.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div>
          <span className="text-3xl font-bold">${plan.price.toLocaleString('es-CO')}</span>
          <span className="text-muted-foreground">/{plan.billingPeriod === 'monthly' ? 'mes' : 'año'}</span>
        </div>
        <Separator />
        <ul className="space-y-2 text-sm text-muted-foreground">
        {plan.features.slice(0, 3).map((feature, index) => (
            <li key={index} className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                <span>{feature}</span>
            </li>
        ))}
        {plan.features.length > 3 && (
             <li className="flex items-center">
                <List className="h-4 w-4 mr-2" />
                <span>y {plan.features.length - 3} más...</span>
            </li>
        )}
        </ul>
        <div className="text-xs text-muted-foreground pt-2">
            <span className="font-semibold mr-2">Orden de visualización:</span> 
            <span>{plan.order}</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center gap-1 bg-muted/30 p-2 border-t">
        <div className='flex gap-1'>
            <Button variant="ghost" size="icon" onClick={() => onReorder(plan, 'up')}>
                <ArrowUp className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onReorder(plan, 'down')}>
                <ArrowDown className="h-4 w-4" />
            </Button>
        </div>
        <div className='flex gap-1'>
            <Button variant="ghost" size="icon" onClick={togglePopular}>
                <Star className={cn("h-4 w-4", plan.isPopular ? "fill-yellow-400 text-yellow-400" : "")} />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onEdit(plan)}>
                <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="hover:text-destructive text-destructive/70" onClick={() => onDelete(plan)}>
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
