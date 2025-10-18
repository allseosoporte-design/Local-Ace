
'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
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
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { QRForm, type QRFormData } from '@/components/qr-form';
import { NequiIcon, BancolombiaIcon, StripeIcon, MercadoPagoIcon, PayPalIcon, DaviplataIcon } from '@/components/icons/payment-methods';
import type { PlanPaymentSettings } from '@/types/payment-settings';

const PaymentMethodForm = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
    <AccordionItem value={title} className="bg-white border rounded-lg overflow-hidden">
        <AccordionTrigger className="hover:no-underline px-6 py-4 data-[state=open]:bg-stone-50">
            <div className="flex items-center gap-4 text-lg font-semibold">
                {icon}
                <span>{title}</span>
            </div>
        </AccordionTrigger>
        <AccordionContent>
            <Card className="border-none bg-stone-50 rounded-t-none">
                <CardContent className="p-6 space-y-6">
                    {children}
                </CardContent>
            </Card>
        </AccordionContent>
    </AccordionItem>
);

interface PaymentPlanFormProps {
    isLoading: boolean;
    settings: PlanPaymentSettings;
    setSettings: React.Dispatch<React.SetStateAction<PlanPaymentSettings>>;
}

export function PaymentPlanForm({ isLoading, settings, setSettings }: PaymentPlanFormProps) {
    
    const handleStripeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setSettings(prev => ({ ...prev, stripe: { ...prev.stripe, [id]: value } }));
    };

    const handleMercadoPagoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setSettings(prev => ({ ...prev, mercadoPago: { ...prev.mercadoPago, [id]: value } }));
    };

    const handleSetData = (method: 'nequi' | 'bancolombia' | 'daviplata') => (data: QRFormData) => {
        setSettings(prev => ({...prev, [method]: data}));
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin h-8 w-8 text-muted-foreground"/></div>;
    }

    return (
        <div className='bg-[#FFF7F4] p-6 rounded-b-lg space-y-6'>
            <div className="flex items-center gap-2">
                <Switch 
                    id="cashOnDelivery"
                    checked={settings.cashOnDelivery}
                    onCheckedChange={(checked) => setSettings(p => ({ ...p, cashOnDelivery: checked}))}
                />
                <Label htmlFor="cashOnDelivery">Habilitar pago contra entrega</Label>
            </div>
             <Accordion type="multiple" defaultValue={['Nequi']} className="w-full space-y-4">
                <PaymentMethodForm icon={<NequiIcon />} title="Nequi">
                    <QRForm methodName="Nequi" data={settings.nequi} setData={handleSetData('nequi')} />
                </PaymentMethodForm>

                 <PaymentMethodForm icon={<DaviplataIcon />} title="Daviplata">
                    <QRForm methodName="Daviplata" data={settings.daviplata} setData={handleSetData('daviplata')} />
                </PaymentMethodForm>

                <PaymentMethodForm icon={<BancolombiaIcon />} title="Bancolombia">
                        <QRForm methodName="Bancolombia" data={settings.bancolombia} setData={handleSetData('bancolombia')} />
                </PaymentMethodForm>

                <PaymentMethodForm icon={<MercadoPagoIcon />} title="Mercado Pago">
                        <div className="flex justify-end">
                        <div className="flex items-center gap-2">
                            <Label htmlFor="switch-mp">Mercado Pago está activado</Label>
                            <Switch 
                                id="switch-mp"
                                checked={settings.mercadoPago.enabled}
                                onCheckedChange={(checked) => setSettings(p => ({ ...p, mercadoPago: {...p.mercadoPago, enabled: checked}}))}
                            />
                        </div>
                    </div>
                        <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="accessToken-mp">Access Token</Label>
                            <Input id="accessToken" type="password" placeholder="APP_USR-********************************" value={settings.mercadoPago.accessToken} onChange={handleMercadoPagoChange} />
                        </div>
                            <div className="space-y-2">
                            <Label htmlFor="publicKey-mp">Public Key</Label>
                            <Input id="publicKey" type="password" placeholder="APP_USR-********-****-****-****-************" value={settings.mercadoPago.publicKey} onChange={handleMercadoPagoChange} />
                        </div>
                        <div className="space-y-2">
                                <Label htmlFor="mode-mp">Modo de entorno</Label>
                            <Select 
                                value={settings.mercadoPago.mode} 
                                onValueChange={(value: 'production' | 'sandbox') => setSettings(p => ({ ...p, mercadoPago: {...p.mercadoPago, mode: value}}))}
                            >
                                <SelectTrigger id="mode-mp">
                                    <SelectValue placeholder="Seleccionar modo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="production">Producción</SelectItem>
                                    <SelectItem value="sandbox">Sandbox</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="instructions-mp">Instrucción para el cliente</Label>
                            <Textarea id="instructions" placeholder='Completa tu pago a través de Mercado Pago. Justo después de confirmar tu suscripción, serás redirigido a la página de pagos.' value={settings.mercadoPago.instructions} onChange={handleMercadoPagoChange} />
                        </div>
                    </div>
                </PaymentMethodForm>

                <PaymentMethodForm icon={<StripeIcon />} title="Stripe">
                        <div className="flex justify-end">
                        <div className="flex items-center gap-2">
                            <Label htmlFor="switch-stripe">Stripe está activado</Label>
                            <Switch 
                                id="switch-stripe" 
                                checked={settings.stripe.enabled}
                                onCheckedChange={(checked) => setSettings(p => ({ ...p, stripe: {...p.stripe, enabled: checked}}))}
                            />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="publicKey-stripe">Public Key</Label>
                            <Input id="publicKey" type="password" placeholder="pk_test_************************" value={settings.stripe.publicKey} onChange={handleStripeChange} />
                        </div>
                            <div className="space-y-2">
                            <Label htmlFor="secretKey-stripe">Secret Key</Label>
                            <Input id="secretKey" type="password" placeholder="sk_test_************************" value={settings.stripe.secretKey} onChange={handleStripeChange} />
                        </div>
                    </div>
                </PaymentMethodForm>
                
                 <PaymentMethodForm icon={<PayPalIcon />} title="PayPal">
                    <div className="flex justify-end">
                        <div className="flex items-center gap-2">
                            <Label htmlFor="switch-paypal">PayPal está activado</Label>
                            <Switch id="switch-paypal" disabled />
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground text-center pt-4">La configuración de PayPal estará disponible próximamente.</p>
                </PaymentMethodForm>

            </Accordion>
        </div>
    )
}
