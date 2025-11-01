
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
import { CheckCircle, List } from 'lucide-react';
import type { SubscriptionPlan } from '@/types/subscription-plan';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface PublicPlanCardProps {
  plan: SubscriptionPlan;
}

export function PublicPlanCard({ plan }: PublicPlanCardProps) {
  return (
    <Card className={cn(
        "flex flex-col border-2",
        plan.isPopular ? 'border-primary shadow-lg' : 'border-border',
        !plan.isActive && "bg-muted/50"
    )}>
      {plan.isPopular && (
        <div className="bg-primary text-primary-foreground text-center text-sm font-bold py-1 rounded-t-lg">
            Más Popular
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-xl">{plan.name}</CardTitle>
        <CardDescription className="h-12">{plan.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div>
          <span className="text-4xl font-bold">${plan.price.toLocaleString('es-CO')}</span>
          <span className="text-muted-foreground">/{plan.billingPeriod === 'monthly' ? 'mes' : 'año'}</span>
        </div>
        <Separator />
        <ul className="space-y-3 text-sm text-muted-foreground">
        {plan.features.slice(0, 5).map((feature, index) => (
            <li key={index} className="flex items-start">
                <CheckCircle className="h-4 w-4 mr-2 mt-1 shrink-0 text-green-500" />
                <span>{feature}</span>
            </li>
        ))}
        {plan.features.length > 5 && (
             <li className="flex items-center text-xs">
                <List className="h-3 w-3 mr-2" />
                <span>y {plan.features.length - 5} más...</span>
            </li>
        )}
        </ul>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full" size="lg">
            <Link href="/register">
                Elegir Plan
            </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
