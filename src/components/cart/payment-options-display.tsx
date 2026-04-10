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
  WompiIcon,
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
  },
  wompi: {
    label: 'Wompi',
    icon: <WompiIcon />,
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
    return <p className="text-sm text-center text-muted-foreground py-4">No hay métodos de pago configurados.</p>;
  }

  const enabledMethods = Object.entries(settings)
    .map(([key, value]) => {
      // Handle boolean for cashOnDelivery
      if (key === 'cashOnDelivery' && value === true) {
        const config = paymentMethodConfig[key];
        return config ? { key, ...config, details: null } : null;
      }
      
      // Handle objects with 'enabled' property (QR and API methods)
      if (typeof value === 'object' && value !== null && 'enabled' in value && value.enabled) {
         const config = paymentMethodConfig[key as keyof typeof paymentMethodConfig];
         return config ? { key, ...config, details: value } : null;
      }
      return null;
    })
    .filter((method): method is NonNullable<typeof method> => method !== null);

  if (enabledMethods.length === 0) {
    return (
      <div className="text-center py-4 space-y-2">
        <p className="text-sm text-muted-foreground italic">No hay métodos de pago habilitados por el comercio.</p>
        <p className="text-xs text-muted-foreground">Por favor, contacta al vendedor para acordar el pago.</p>
      </div>
    );
  }


  return (
    <RadioGroup value={selectedValue ?? undefined} onValueChange={onValueChange} className="space-y-3">
        {enabledMethods.map((method) => (
            <Label 
              key={method.key} 
              htmlFor={method.key} 
              className="p-3 border rounded-md bg-background flex items-center gap-4 cursor-pointer hover:bg-muted/50 has-[:checked]:bg-primary/5 has-[:checked]:border-primary transition-colors"
            >
                <RadioGroupItem value={method.label} id={method.key} />
                <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 flex items-center justify-center shrink-0">
                      {method.icon}
                    </div>
                    <span className="font-medium text-sm">{method.label}</span>
                </div>
                {method.details && 'qrImageUrl' in method.details && method.details.qrImageUrl && (
                    <div className="w-10 h-10 relative ml-auto border rounded bg-white p-0.5">
                        <Image 
                          src={method.details.qrImageUrl} 
                          alt={`${method.label} QR`} 
                          fill 
                          className="object-contain" 
                        />
                    </div>
                )}
            </Label>
        ))}
    </RadioGroup>
  );
}