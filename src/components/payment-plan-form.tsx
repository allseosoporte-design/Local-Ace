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
  WompiIcon,
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
                <Input id="stripe-publicKey" value={data?.publicKey || ''} onChange={(e) => setData({ ...data, publicKey: e.target.value })} placeholder="pk_test_..."/>
            </div>
            <div className="space-y-2">
                <Label htmlFor="stripe-secretKey">Secret Key</Label>
                <Input id="stripe-secretKey" type="password" value={data?.secretKey || ''} onChange={(e) => setData({ ...data, secretKey: e.target.value })} placeholder="sk_test_..."/>
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
                <Input id="mp-publicKey" value={data?.publicKey || ''} onChange={(e) => setData({ ...data, publicKey: e.target.value })} placeholder="APP_USR-..."/>
            </div>
            <div className="space-y-2">
                <Label htmlFor="mp-accessToken">Access Token</Label>
                <Input id="mp-accessToken" type="password" value={data?.accessToken || ''} onChange={(e) => setData({ ...data, accessToken: e.target.value })} placeholder="APP_USR-..."/>
            </div>
            <div className="space-y-2">
                <Label htmlFor="mp-mode">Modo</Label>
                <Select value={data?.mode || 'sandbox'} onValueChange={(value) => setData({ ...data, mode: value })}>
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

const PayPalForm = ({ data, setData }: any) => (
    <Card className="mt-4 bg-white animate-in fade-in-50">
        <CardHeader><CardTitle className="text-base">Configuración de PayPal</CardTitle></CardHeader>
        <CardContent className="space-y-4">
             <div className="space-y-2">
                <Label htmlFor="paypal-clientId">Client ID</Label>
                <Input id="paypal-clientId" value={data?.clientId || ''} onChange={(e) => setData({ ...data, clientId: e.target.value })} placeholder="Abc..."/>
            </div>
            <div className="space-y-2">
                <Label htmlFor="paypal-clientSecret">Client Secret</Label>
                <Input id="paypal-clientSecret" type="password" value={data?.clientSecret || ''} onChange={(e) => setData({ ...data, clientSecret: e.target.value })} placeholder="Efg..."/>
            </div>
            <div className="space-y-2">
                <Label htmlFor="paypal-mode">Modo</Label>
                <Select value={data?.mode || 'sandbox'} onValueChange={(value) => setData({ ...data, mode: value })}>
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

const WompiForm = ({ data, setData }: any) => (
    <Card className="mt-4 bg-white animate-in fade-in-50">
        <CardHeader><CardTitle className="text-base">Configuración de Wompi</CardTitle></CardHeader>
        <CardContent className="space-y-4">
             <div className="space-y-2">
                <Label htmlFor="wompi-publicKey">Public Key</Label>
                <Input id="wompi-publicKey" value={data?.publicKey || ''} onChange={(e) => setData({ ...data, publicKey: e.target.value })} placeholder="pub_..."/>
            </div>
            <div className="space-y-2">
                <Label htmlFor="wompi-privateKey">Private Key</Label>
                <Input id="wompi-privateKey" type="password" value={data?.privateKey || ''} onChange={(e) => setData({ ...data, privateKey: e.target.value })} placeholder="prv_..."/>
            </div>
             <div className="space-y-2">
                <Label htmlFor="wompi-mode">Modo</Label>
                <Select value={data?.mode || 'sandbox'} onValueChange={(value) => setData({ ...data, mode: value })}>
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
    useState<keyof PlanPaymentSettings>('nequi');

  if (isLoading || !settings) {
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
    setSettings((prev) => ({ 
      ...prev, 
      [method]: { ...(prev?.[method] || {}), ...data } 
    }));
  };

  const handleGatewayDataChange = (method: keyof PlanPaymentSettings, data: any) => {
    setSettings(prev => ({
      ...prev,
      [method]: { ...(prev?.[method] as object || {}), ...data }
    }));
  }

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
            checked={settings?.nequi?.enabled ?? false}
            onCheckedChange={(checked) =>
              setSettings((p) => ({
                ...p,
                nequi: { ...(p?.nequi || {}), enabled: checked },
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
            checked={settings?.daviplata?.enabled ?? false}
            onCheckedChange={(checked) =>
              setSettings((p) => ({
                ...p,
                daviplata: { ...(p?.daviplata || {}), enabled: checked },
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
            checked={settings?.bancolombia?.enabled ?? false}
            onCheckedChange={(checked) =>
              setSettings((p) => ({
                ...p,
                bancolombia: { ...(p?.bancolombia || {}), enabled: checked },
              }))
            }
          />
        </PaymentMethodSelector>
        
        <PaymentMethodSelector
          value="wompi"
          title="Wompi"
          icon={<WompiIcon />}
        >
          <Switch
            checked={settings?.wompi?.enabled ?? false}
            onCheckedChange={(checked) =>
              setSettings((p) => ({
                ...p,
                wompi: { ...(p?.wompi || {}), enabled: checked },
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
            checked={settings?.stripe?.enabled ?? false}
            onCheckedChange={(checked) =>
              setSettings((p) => ({
                ...p,
                stripe: { ...(p?.stripe || {}), enabled: checked },
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
            checked={settings?.mercadoPago?.enabled ?? false}
            onCheckedChange={(checked) =>
              setSettings((p) => ({
                ...p,
                mercadoPago: { ...(p?.mercadoPago || {}), enabled: checked },
              }))
            }
          />
        </PaymentMethodSelector>

        <PaymentMethodSelector
          value="paypal"
          title="PayPal"
          icon={<PayPalIcon />}
        >
           <Switch
            checked={settings?.paypal?.enabled ?? false}
            onCheckedChange={(checked) =>
              setSettings((p) => ({
                ...p,
                paypal: { ...(p?.paypal || {}), enabled: checked },
              }))
            }
          />
        </PaymentMethodSelector>

        <PaymentMethodSelector
          value="cashOnDelivery"
          title="Pago Contra Entrega"
          icon={<Wallet className="h-6 w-6" />}
        >
          <Switch
            checked={settings?.cashOnDelivery ?? false}
            onCheckedChange={(checked) =>
              setSettings((p) => ({ ...p, cashOnDelivery: checked }))
            }
          />
        </PaymentMethodSelector>
      </RadioGroup>

      {selectedMethod === 'nequi' && settings?.nequi?.enabled && (
        <QRForm
          methodName="Nequi"
          data={settings.nequi}
          setData={(data) => handleQRDataChange('nequi', data)}
        />
      )}
      {selectedMethod === 'daviplata' && settings?.daviplata?.enabled && (
        <QRForm
          methodName="Daviplata"
          data={settings.daviplata}
          setData={(data) => handleQRDataChange('daviplata', data)}
        />
      )}
      {selectedMethod === 'bancolombia' && settings?.bancolombia?.enabled && (
        <QRForm
          methodName="Bancolombia"
          data={settings.bancolombia}
          setData={(data) => handleQRDataChange('bancolombia', data)}
        />
      )}
       {selectedMethod === 'stripe' && settings?.stripe?.enabled && (
        <StripeForm data={settings.stripe} setData={(d: any) => handleGatewayDataChange('stripe', d)} />
      )}
      {selectedMethod === 'mercadoPago' && settings?.mercadoPago?.enabled && (
        <MercadoPagoForm data={settings.mercadoPago} setData={(d: any) => handleGatewayDataChange('mercadoPago', d)} />
      )}
      {selectedMethod === 'paypal' && settings?.paypal?.enabled && (
        <PayPalForm data={settings.paypal} setData={(d: any) => handleGatewayDataChange('paypal', d)} />
      )}
      {selectedMethod === 'wompi' && settings?.wompi?.enabled && (
        <WompiForm data={settings.wompi} setData={(d: any) => handleGatewayDataChange('wompi', d)} />
      )}
    </div>
  );
}
