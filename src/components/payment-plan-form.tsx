'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { QRForm, type QRFormData } from '@/components/qr-form';
import { NequiIcon, BancolombiaIcon, StripeIcon, MercadoPagoIcon, PayPalIcon, DaviplataIcon } from '@/components/icons/payment-methods';
import type { PlanPaymentSettings } from '@/types/payment-settings';
import Image from 'next/image';

const PaymentMethodSelector = ({ icon, title, value, children }: { icon: React.ReactNode, title: string, value: string, children?: React.ReactNode }) => (
    <Label htmlFor={value} className="p-4 border rounded-md bg-white flex items-center gap-4 cursor-pointer hover:bg-muted/50 has-[:checked]:bg-blue-50 has-[:checked]:border-blue-300 transition-all">
        <RadioGroupItem value={value} id={value} />
        <div className="flex items-center gap-3 flex-1">
            {icon}
            <span className="font-medium text-sm">{title}</span>
        </div>
        {children}
    </Label>
);

const DetailsCard = ({ method }: { method: QRFormData | undefined }) => {
    if (!method || !method.enabled || !method.qrImageUrl) {
        return null;
    }

    return (
        <Card className="mt-4 bg-white animate-in fade-in-50">
            <CardHeader>
                <CardTitle className='text-base'>Paga a la siguiente cuenta:</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
                <div className='text-left space-y-2'>
                    <p><span className='font-semibold'>Titular:</span> {method.holderName}</p>
                    <p><span className='font-semibold'>Cuenta:</span> {method.accountNumber}</p>
                </div>
                <p className='font-semibold'>O escanea el código QR:</p>
                <div className="relative w-[200px] h-[200px] mx-auto">
                    <Image
                        src={method.qrImageUrl}
                        alt={`Código QR`}
                        width={200}
                        height={200}
                        className="rounded-md object-contain"
                    />
                </div>
            </CardContent>
        </Card>
    )
}

interface PaymentPlanFormProps {
    isLoading: boolean;
    settings: PlanPaymentSettings;
    setSettings: React.Dispatch<React.SetStateAction<PlanPaymentSettings>>;
}

export function PaymentPlanForm({ isLoading, settings, setSettings }: PaymentPlanFormProps) {
    const [selectedMethod, setSelectedMethod] = useState<string>('nequi');
    
    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin h-8 w-8 text-muted-foreground"/></div>;
    }
    
    const currentMethodDetails = settings[selectedMethod as keyof typeof settings];

    return (
        <div className='bg-[#FFF7F4] p-6 rounded-b-lg space-y-4'>
            <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod} className="space-y-3">
                <PaymentMethodSelector value="nequi" title="Paga con Nequi" icon={<NequiIcon />}>
                    <Switch
                        checked={settings.nequi.enabled}
                        onCheckedChange={(checked) => setSettings(p => ({ ...p, nequi: { ...p.nequi, enabled: checked } }))}
                    />
                </PaymentMethodSelector>
                <PaymentMethodSelector value="daviplata" title="Paga con Daviplata" icon={<DaviplataIcon />}>
                     <Switch
                        checked={settings.daviplata.enabled}
                        onCheckedChange={(checked) => setSettings(p => ({ ...p, daviplata: { ...p.daviplata, enabled: checked } }))}
                    />
                </PaymentMethodSelector>
                <PaymentMethodSelector value="bancolombia" title="Paga con Bancolombia QR" icon={<BancolombiaIcon />}>
                     <Switch
                        checked={settings.bancolombia.enabled}
                        onCheckedChange={(checked) => setSettings(p => ({ ...p, bancolombia: { ...p.bancolombia, enabled: checked } }))}
                    />
                </PaymentMethodSelector>
                <PaymentMethodSelector value="cashOnDelivery" title="Pago Contra Entrega" icon={<WalletIcon />}>
                    <Switch
                        checked={settings.cashOnDelivery}
                        onCheckedChange={(checked) => setSettings(p => ({ ...p, cashOnDelivery: checked }))}
                    />
                </PaymentMethodSelector>
            </RadioGroup>

            {typeof currentMethodDetails === 'object' && currentMethodDetails && 'qrImageUrl' in currentMethodDetails && (
                 <DetailsCard method={currentMethodDetails as QRFormData} />
            )}
        </div>
    )
}

const WalletIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-wallet"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
)
