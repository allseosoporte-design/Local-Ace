
'use client';

import Image from 'next/image';
import { Loader2, Wallet } from 'lucide-react';
import type { PlanPaymentSettings } from '@/types/payment-settings';
import {
  NequiIcon,
  BancolombiaIcon,
  DaviplataIcon,
  StripeIcon,
  MercadoPagoIcon,
  PayPalIcon,
} from '@/components/icons/payment-methods';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface PaymentOptionsDisplayProps {
  settings: PlanPaymentSettings | null;
  isLoading: boolean;
  selectedValue: string | null;
  onValueChange: (value: string) => void;
}

const paymentMethodConfig = {
  cashOnDelivery: {
    label: 'Pago Contra Entrega',
    icon: <Wallet className="h-6 w-6" />,
  },
  nequi: {
    label: 'Nequi',
    icon: <NequiIcon />,
  },
  daviplata: {
    label: 'Daviplata',
    icon: <DaviplataIcon />,
  },
  bancolombia: {
    label: 'Bancolombia',
    icon: <BancolombiaIcon />,
  },
  mercadoPago: {
    label: 'Mercado Pago',
    icon: <MercadoPagoIcon />,
  },
  stripe: {
    label: 'Stripe',
    icon: <StripeIcon />,
  },
   paypal: {
    label: 'PayPal',
    icon: <PayPalIcon />,
  }
};


export function PaymentOptionsDisplay({ settings, isLoading, selectedValue, onValueChange }: PaymentOptionsDisplayProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (!settings) {
    return <p className="text-sm text-center text-muted-foreground">No hay métodos de pago configurados.</p>;
  }

  const enabledMethods = Object.entries(settings)
    .map(([key, value]) => {
      // Handle boolean for cashOnDelivery
      if (typeof value === 'boolean' && value === true && key === 'cashOnDelivery') {
        const config = paymentMethodConfig[key];
        return config ? { key, ...config, details: null } : null;
      }
      // Handle objects with 'enabled' property
      if (typeof value === 'object' && value && 'enabled' in value && value.enabled) {
         const config = paymentMethodConfig[key as keyof typeof paymentMethodConfig];
         return config ? { key, ...config, details: value } : null;
      }
      return null;
    })
    .filter(Boolean);

  if (enabledMethods.length === 0) {
    return <p className="text-sm text-center text-muted-foreground">No hay métodos de pago habilitados.</p>;
  }


  return (
    <RadioGroup value={selectedValue ?? undefined} onValueChange={onValueChange} className="space-y-3">
        {enabledMethods.map((method) => (
            method && (
            <Label key={method.key} htmlFor={method.key} className="p-3 border rounded-md bg-background flex items-center gap-4 cursor-pointer hover:bg-muted/50 has-[:checked]:bg-blue-50 has-[:checked]:border-blue-300">
                <RadioGroupItem value={method.label} id={method.key} />
                <div className="flex items-center gap-3 flex-1">
                    {method.icon}
                    <span className="font-medium text-sm">{method.label}</span>
                </div>
                {method.details?.qrImageUrl && (
                    <div className="w-12 h-12 relative ml-auto">
                        <Image src={method.details.qrImageUrl} alt={`${method.label} QR`} layout='fill' objectFit='contain' />
                    </div>
                )}
            </Label>
            )
        ))}
    </RadioGroup>
  );
}
