
'use client';

import { useState } from 'react';
import { Loader2, Wallet, Plus, Copy, Trash2, Pencil, ExternalLink } from 'lucide-react';
import { QRForm, type QRFormData } from '@/components/qr-form';
import {
  NequiIcon,
  BancolombiaIcon,
  DaviplataIcon,
  StripeIcon,
  MercadoPagoIcon,
  PayPalIcon,
  WompiIcon,
} from '@/components/icons/payment-methods';
import type { 
    PlanPaymentSettings, 
    StripeData, 
    MercadoPagoData, 
    PayPalData, 
    WompiData,
    PaymentLink
} from '@/types/payment-settings';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from './ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

interface PaymentMethodSelectorProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  children?: React.ReactNode;
}

const PaymentMethodSelector = ({
  icon,
  title,
  value,
  children,
}: PaymentMethodSelectorProps) => (
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

interface PaymentLinksManagerProps {
    links: PaymentLink[];
    onUpdate: (links: PaymentLink[]) => void;
}

const PaymentLinksManager = ({ links, onUpdate }: PaymentLinksManagerProps) => {
    const { toast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLink, setEditingLink] = useState<PaymentLink | null>(null);
    const [formData, setFormData] = useState<Omit<PaymentLink, 'id'>>({
        name: '',
        amount: 0,
        currency: 'COP',
        url: '',
        isActive: true
    });

    const handleOpenCreate = () => {
        setEditingLink(null);
        setFormData({ name: '', amount: 0, currency: 'COP', url: '', isActive: true });
        setIsModalOpen(true);
    };

    const handleEdit = (link: PaymentLink) => {
        setEditingLink(link);
        setFormData({ ...link });
        setIsModalOpen(true);
    };

    const handleSave = () => {
        if (!formData.name || !formData.url || formData.amount <= 0) {
            toast({ variant: 'destructive', title: 'Campos incompletos', description: 'Por favor rellena todos los datos obligatorios.' });
            return;
        }

        if (editingLink) {
            onUpdate(links.map(l => l.id === editingLink.id ? { ...formData, id: l.id } : l));
            toast({ title: 'Enlace actualizado' });
        } else {
            onUpdate([...links, { ...formData, id: uuidv4() }]);
            toast({ title: 'Enlace creado' });
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id: string) => {
        onUpdate(links.filter(l => l.id !== id));
        toast({ title: 'Enlace eliminado' });
    };

    const handleToggle = (id: string, active: boolean) => {
        onUpdate(links.map(l => l.id === id ? { ...l, isActive: active } : l));
    };

    const handleCopy = (url: string) => {
        navigator.clipboard.writeText(url);
        toast({ title: '¡Copiado!', description: 'El enlace de pago ha sido copiado al portapapeles.' });
    };

    return (
        <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                    <Label className="text-base font-bold">Gestión de Enlaces de Pago</Label>
                    <p className="text-xs text-muted-foreground">Crea y administra botones de pago directo para tus clientes.</p>
                </div>
                <Button size="sm" onClick={handleOpenCreate} className="gap-2">
                    <Plus className="h-4 w-4" /> Crear Enlace de Pago
                </Button>
            </div>

            {links.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed rounded-lg bg-muted/20">
                    <p className="text-sm text-muted-foreground italic">No hay enlaces de pago registrados todavía.</p>
                </div>
            ) : (
                <div className="grid gap-3">
                    {links.map((link) => (
                        <Card key={link.id} className={`transition-all ${!link.isActive ? 'opacity-60 bg-muted/50' : 'bg-background'}`}>
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold text-sm truncate">{link.name}</p>
                                        <Badge variant={link.isActive ? 'default' : 'secondary'} className="text-[10px] h-4">
                                            {link.isActive ? 'Activo' : 'Inactivo'}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                        <span className="font-bold text-primary">
                                            {new Intl.NumberFormat('es-CO', { style: 'currency', currency: link.currency }).format(link.amount)}
                                        </span>
                                        <span className="truncate max-w-[200px] opacity-70">{link.url}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 pl-4">
                                    <Switch checked={link.isActive} onCheckedChange={(val) => handleToggle(link.id, val)} />
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCopy(link.url)} title="Copiar enlace">
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(link)} title="Editar">
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(link.id)} title="Eliminar">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingLink ? 'Editar Enlace de Pago' : 'Nuevo Enlace de Pago'}</DialogTitle>
                        <DialogDescription>Completa los datos para generar el botón de pago.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nombre o descripción</Label>
                            <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Ej: Suscripción Mensual Pro" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Monto / Valor</Label>
                                <Input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })} placeholder="0.00" />
                            </div>
                            <div className="space-y-2">
                                <Label>Moneda</Label>
                                <Select value={formData.currency} onValueChange={(val) => setFormData({ ...formData, currency: val })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="COP">COP</SelectItem>
                                        <SelectItem value="USD">USD</SelectItem>
                                        <SelectItem value="EUR">EUR</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>URL de destino (Enlace generado)</Label>
                            <Input value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} placeholder="https://..." />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSave}>{editingLink ? 'Actualizar' : 'Crear Enlace'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

const Badge = ({ children, variant = 'default', className }: { children: React.ReactNode, variant?: 'default' | 'secondary' | 'destructive', className?: string }) => {
    const variants = {
        default: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
        destructive: 'bg-destructive text-destructive-foreground'
    };
    return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>{children}</span>;
}

interface GatewayFormProps<T> {
    data: T;
    setData: (data: T) => void;
}

const StripeForm = ({ data, setData }: GatewayFormProps<StripeData>) => (
    <Card className="mt-4 bg-white animate-in fade-in-50">
        <CardHeader>
            <CardTitle className="text-base">Configuración de Stripe</CardTitle>
            <CardDescription>Gestiona tus credenciales y enlaces de pago de Stripe Checkout.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="stripe-publicKey">Public Key</Label>
                <Input id="stripe-publicKey" value={data?.publicKey || ''} onChange={(e) => setData({ ...data, publicKey: e.target.value })} placeholder="pk_test_..."/>
            </div>
            <div className="space-y-2">
                <Label htmlFor="stripe-secretKey">Secret Key</Label>
                <Input id="stripe-secretKey" type="password" value={data?.secretKey || ''} onChange={(e) => setData({ ...data, secretKey: e.target.value })} placeholder="sk_test_..."/>
            </div>
            <PaymentLinksManager 
                links={data?.paymentLinks || []} 
                onUpdate={(links) => setData({ ...data, paymentLinks: links })} 
            />
        </CardContent>
    </Card>
);

const MercadoPagoForm = ({ data, setData }: GatewayFormProps<MercadoPagoData>) => (
    <Card className="mt-4 bg-white animate-in fade-in-50">
        <CardHeader>
            <CardTitle className="text-base">Configuración de Mercado Pago</CardTitle>
            <CardDescription>Configura tus credenciales y preferencias de pago.</CardDescription>
        </CardHeader>
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
                <Select value={data?.mode || 'sandbox'} onValueChange={(value: 'production' | 'sandbox') => setData({ ...data, mode: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="production">Producción</SelectItem>
                        <SelectItem value="sandbox">Sandbox</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <PaymentLinksManager 
                links={data?.paymentLinks || []} 
                onUpdate={(links) => setData({ ...data, paymentLinks: links })} 
            />
        </CardContent>
    </Card>
);

const PayPalForm = ({ data, setData }: GatewayFormProps<PayPalData>) => (
    <Card className="mt-4 bg-white animate-in fade-in-50">
        <CardHeader>
            <CardTitle className="text-base">Configuración de PayPal</CardTitle>
            <CardDescription>Usa enlaces de PayPal.me o planes de suscripción.</CardDescription>
        </CardHeader>
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
                <Select value={data?.mode || 'sandbox'} onValueChange={(value: 'production' | 'sandbox') => setData({ ...data, mode: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="production">Producción</SelectItem>
                        <SelectItem value="sandbox">Sandbox</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <PaymentLinksManager 
                links={data?.paymentLinks || []} 
                onUpdate={(links) => setData({ ...data, paymentLinks: links })} 
            />
        </CardContent>
    </Card>
);

const WompiForm = ({ data, setData }: GatewayFormProps<WompiData>) => (
    <Card className="mt-4 bg-white animate-in fade-in-50">
        <CardHeader>
            <CardTitle className="text-base">Configuración de Wompi</CardTitle>
            <CardDescription>Enlaces de pago directos y credenciales de API Wompi.</CardDescription>
        </CardHeader>
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
                <Select value={data?.mode || 'sandbox'} onValueChange={(value: 'production' | 'sandbox') => setData({ ...data, mode: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="production">Producción</SelectItem>
                        <SelectItem value="sandbox">Sandbox</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <PaymentLinksManager 
                links={data?.paymentLinks || []} 
                onUpdate={(links) => setData({ ...data, paymentLinks: links })} 
            />
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
    data: Partial<QRFormData>
  ) => {
    setSettings((prev) => ({ 
      ...prev, 
      [method]: { ...(prev?.[method] || {}), ...data } 
    }));
  };

  const handleGatewayDataChange = <K extends 'stripe' | 'mercadoPago' | 'paypal' | 'wompi'>(
    method: K, 
    data: Partial<PlanPaymentSettings[K]>
  ) => {
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
        <StripeForm data={settings.stripe} setData={(d) => handleGatewayDataChange('stripe', d)} />
      )}
      {selectedMethod === 'mercadoPago' && settings?.mercadoPago?.enabled && (
        <MercadoPagoForm data={settings.mercadoPago} setData={(d) => handleGatewayDataChange('mercadoPago', d)} />
      )}
      {selectedMethod === 'paypal' && settings?.paypal?.enabled && (
        <PayPalForm data={settings.paypal} setData={(d) => handleGatewayDataChange('paypal', d)} />
      )}
      {selectedMethod === 'wompi' && settings?.wompi?.enabled && (
        <WompiForm data={settings.wompi} setData={(d) => handleGatewayDataChange('wompi', d)} />
      )}
    </div>
  );
}
