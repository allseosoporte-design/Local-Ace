'use client';

import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import type { PlanPaymentSettings } from '@/types/payment-settings';
import {
  NequiIcon,
  BancolombiaIcon,
  DaviplataIcon,
  StripeIcon,
  MercadoPagoIcon,
  PayPalIcon,
} from '@/components/icons/payment-methods';

interface PaymentOptionsDisplayProps {
  settings: PlanPaymentSettings | null;
  isLoading: boolean;
}

const paymentMethodConfig = {
  cashOnDelivery: {
    label: 'Pago Contra Entrega',
    icon: null,
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
    label: 'Tarjeta de Crédito (Stripe)',
    icon: <StripeIcon />,
  },
   paypal: {
    label: 'PayPal',
    icon: <PayPalIcon />,
  }
};


export function PaymentOptionsDisplay({ settings, isLoading }: PaymentOptionsDisplayProps) {
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
      if (typeof value === 'boolean' && value === true && key === 'cashOnDelivery') {
        return { key, ...paymentMethodConfig[key], details: null };
      }
      if (typeof value === 'object' && value.enabled) {
        return { key, ...paymentMethodConfig[key as keyof typeof paymentMethodConfig], details: value };
      }
      return null;
    })
    .filter(Boolean);

  if (enabledMethods.length === 0) {
    return <p className="text-sm text-center text-muted-foreground">No hay métodos de pago habilitados.</p>;
  }


  return (
    <div className="space-y-4">
      {enabledMethods.map((method) => (
        method && (
          <div key={method.key} className="p-3 border rounded-md bg-background flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              {method.icon}
              <span className="font-medium text-sm">{method.label}</span>
            </div>
            {method.details?.qrImageUrl && (
                <div className="w-16 h-16 relative">
                    <Image src={method.details.qrImageUrl} alt={`${method.label} QR`} layout='fill' objectFit='contain' />
                </div>
            )}
             {method.details && 'instructions' in method.details && method.details.instructions && (
                <p className='text-xs text-muted-foreground sm:w-1/2'>{method.details.instructions}</p>
             )}
          </div>
        )
      ))}
    </div>
  );
}
