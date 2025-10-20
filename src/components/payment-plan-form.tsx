'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { QRForm } from '@/components/qr-form';
import {
  NequiIcon,
  BancolombiaIcon,
  DaviplataIcon,
} from '@/components/icons/payment-methods';
import type { PlanPaymentSettings } from '@/types/payment-settings';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from './ui/switch';

const PaymentMethodSelector = ({
  icon,
  title,
  value,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  children?: React.ReactNode;
}) => (
  <Label
    htmlFor={value}
    className="p-4 border rounded-md bg-white flex items-center gap-4 cursor-pointer hover:bg-muted/50 has-[:checked]:bg-blue-50 has-[:checked]:border-blue-300 transition-all"
  >
    <RadioGroupItem value={value} id={value} />
    <div className="flex items-center gap-3 flex-1">
      {icon}
      <span className="font-medium text-sm">{title}</span>
    </div>
    {children}
  </Label>
);

interface PaymentPlanFormProps {
  isLoading: boolean;
  settings: PlanPaymentSettings;
  setSettings: React.Dispatch<React.SetStateAction<PlanPaymentSettings>>;
}

export function PaymentPlanForm({
  isLoading,
  settings,
  setSettings,
}: PaymentPlanFormProps) {
  const [selectedMethod, setSelectedMethod] =
    useState<keyof PlanPaymentSettings>('nequi');

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
      </div>
    );
  }

  const handleQRDataChange = (
    method: 'nequi' | 'daviplata' | 'bancolombia',
    data: any
  ) => {
    setSettings((prev) => ({ ...prev, [method]: data }));
  };

  const currentMethodData = settings[selectedMethod];

  return (
    <div className="bg-[#FFF7F4] p-6 rounded-b-lg space-y-4">
      <RadioGroup
        value={selectedMethod}
        onValueChange={(value) =>
          setSelectedMethod(value as keyof PlanPaymentSettings)
        }
        className="space-y-3"
      >
        <PaymentMethodSelector
          value="nequi"
          title="Paga con Nequi"
          icon={<NequiIcon />}
        >
          <Switch
            checked={settings.nequi.enabled}
            onCheckedChange={(checked) =>
              setSettings((p) => ({
                ...p,
                nequi: { ...p.nequi, enabled: checked },
              }))
            }
          />
        </PaymentMethodSelector>
        <PaymentMethodSelector
          value="daviplata"
          title="Paga con Daviplata"
          icon={<DaviplataIcon />}
        >
          <Switch
            checked={settings.daviplata.enabled}
            onCheckedChange={(checked) =>
              setSettings((p) => ({
                ...p,
                daviplata: { ...p.daviplata, enabled: checked },
              }))
            }
          />
        </PaymentMethodSelector>
        <PaymentMethodSelector
          value="bancolombia"
          title="Paga con Bancolombia QR"
          icon={<BancolombiaIcon />}
        >
          <Switch
            checked={settings.bancolombia.enabled}
            onCheckedChange={(checked) =>
              setSettings((p) => ({
                ...p,
                bancolombia: { ...p.bancolombia, enabled: checked },
              }))
            }
          />
        </PaymentMethodSelector>
        <PaymentMethodSelector
          value="cashOnDelivery"
          title="Pago Contra Entrega"
          icon={<WalletIcon />}
        >
          <Switch
            checked={settings.cashOnDelivery}
            onCheckedChange={(checked) =>
              setSettings((p) => ({ ...p, cashOnDelivery: checked }))
            }
          />
        </PaymentMethodSelector>
      </RadioGroup>

      {selectedMethod === 'nequi' && (
        <QRForm
          methodName="Nequi"
          data={settings.nequi}
          setData={(data) => handleQRDataChange('nequi', data)}
        />
      )}
      {selectedMethod === 'daviplata' && (
        <QRForm
          methodName="Daviplata"
          data={settings.daviplata}
          setData={(data) => handleQRDataChange('daviplata', data)}
        />
      )}
      {selectedMethod === 'bancolombia' && (
        <QRForm
          methodName="Bancolombia"
          data={settings.bancolombia}
          setData={(data) => handleQRDataChange('bancolombia', data)}
        />
      )}
    </div>
  );
}

const WalletIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-wallet"
  >
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
  </svg>
);
