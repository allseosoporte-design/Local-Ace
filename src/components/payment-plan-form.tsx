
'use client';

import { useState } from 'react';
import { Loader2, Wallet } from 'lucide-react';
import { QRForm } from '@/components/qr-form';
import {
  NequiIcon,
  BancolombiaIcon,
  DaviplataIcon,
  StripeIcon,
  MercadoPagoIcon,
  PayPalIcon,
} from '@/components/icons/payment-methods';
import type { PlanPaymentSettings } from '@/types/payment-settings';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from './ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

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

const StripeForm = ({ data, setData }: any) => (
    <Card className="mt-4 bg-white animate-in fade-in-50">
        <CardHeader><CardTitle className="text-base">Configuración de Stripe</CardTitle></CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="stripe-publicKey">Public Key</Label>
                <Input id="stripe-publicKey" value={data.publicKey} onChange={(e) => setData({ ...data, publicKey: e.target.value })} placeholder="pk_test_..."/>
            </div>
            <div className="space-y-2">
                <Label htmlFor="stripe-secretKey">Secret Key</Label>
                <Input id="stripe-secretKey" type="password" value={data.secretKey} onChange={(e) => setData({ ...data, secretKey: e.target.value })} placeholder="sk_test_..."/>
            </div>
        </CardContent>
    </Card>
);

const MercadoPagoForm = ({ data, setData }: any) => (
    <Card className="mt-4 bg-white animate-in fade-in-50">
        <CardHeader><CardTitle className="text-base">Configuración de Mercado Pago</CardTitle></CardHeader>
        <CardContent className="space-y-4">
             <div className="space-y-2">
                <Label htmlFor="mp-publicKey">Public Key</Label>
                <Input id="mp-publicKey" value={data.publicKey} onChange={(e) => setData({ ...data, publicKey: e.target.value })} placeholder="APP_USR-..."/>
            </div>
            <div className="space-y-2">
                <Label htmlFor="mp-accessToken">Access Token</Label>
                <Input id="mp-accessToken" type="password" value={data.accessToken} onChange={(e) => setData({ ...data, accessToken: e.target.value })} placeholder="APP_USR-..."/>
            </div>
            <div className="space-y-2">
                <Label htmlFor="mp-mode">Modo</Label>
                <Select value={data.mode} onValueChange={(value) => setData({ ...data, mode: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="production">Producción</SelectItem>
                        <SelectItem value="sandbox">Sandbox</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </CardContent>
    </Card>
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
    useState<keyof PlanPaymentSettings | 'paypal'>('nequi');

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

  const handleStripeDataChange = (data: any) => {
    setSettings(prev => ({...prev, stripe: data}));
  }

  const handleMercadoPagoDataChange = (data: any) => {
    setSettings(prev => ({...prev, mercadoPago: data}));
  }

  const currentMethodData = settings[selectedMethod as keyof PlanPaymentSettings];

  return (
    <div className="bg-[#FFF7F4] p-6 rounded-b-lg space-y-4">
      <RadioGroup
        value={selectedMethod}
        onValueChange={(value) =>
          setSelectedMethod(value as keyof PlanPaymentSettings | 'paypal')
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
          value="stripe"
          title="Stripe (Tarjetas de crédito)"
          icon={<StripeIcon />}
        >
          <Switch
            checked={settings.stripe.enabled}
            onCheckedChange={(checked) =>
              setSettings((p) => ({
                ...p,
                stripe: { ...p.stripe, enabled: checked },
              }))
            }
          />
        </PaymentMethodSelector>

        <PaymentMethodSelector
          value="mercadoPago"
          title="Mercado Pago"
          icon={<MercadoPagoIcon />}
        >
          <Switch
            checked={settings.mercadoPago.enabled}
            onCheckedChange={(checked) =>
              setSettings((p) => ({
                ...p,
                mercadoPago: { ...p.mercadoPago, enabled: checked },
              }))
            }
          />
        </PaymentMethodSelector>

        <PaymentMethodSelector
          value="paypal"
          title="PayPal"
          icon={<PayPalIcon />}
        >
           {/* PayPal might just be an email or simple link, could be added later */}
           <Switch disabled />
        </PaymentMethodSelector>

        <PaymentMethodSelector
          value="cashOnDelivery"
          title="Pago Contra Entrega"
          icon={<Wallet className="h-6 w-6" />}
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
       {selectedMethod === 'stripe' && (
        <StripeForm data={settings.stripe} setData={handleStripeDataChange} />
      )}
      {selectedMethod === 'mercadoPago' && (
        <MercadoPagoForm data={settings.mercadoPago} setData={handleMercadoPagoDataChange} />
      )}
    </div>
  );
}
