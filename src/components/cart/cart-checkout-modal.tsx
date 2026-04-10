'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCart } from '@/hooks/use-cart';
import { useCartModal } from '@/context/cart-modal-context';
import {
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  Wallet,
  User,
  Loader2,
} from 'lucide-react';
import { useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { PlanPaymentSettings } from '@/types/payment-settings';
import { PaymentOptionsDisplay } from './payment-options-display';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import type { QRFormData } from '../qr-form';
import { SUPER_ADMIN_BUSINESS_ID } from '@/lib/constants';

const DetailsCard = ({ method, methodName }: { method: QRFormData | undefined, methodName: string }) => {
    if (!method || !method.enabled) {
        return null;
    }

    // Ocultar para pago contra entrega
    if (methodName === 'cashOnDelivery') {
        return null;
    }
    
    // Solo mostrar si hay algo que mostrar
    if (!method.qrImageUrl && (!method.holderName || !method.accountNumber)) {
        return null;
    }

    return (
        <Card className="mt-4 bg-white animate-in fade-in-50 border-primary/20 shadow-sm">
            <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-semibold text-primary'>Datos para transferencia:</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
                {method.holderName && method.accountNumber && (
                    <div className='text-left space-y-1 bg-muted/30 p-2 rounded-md border border-dashed border-muted-foreground/20'>
                        <p className='text-xs'><span className='font-bold'>Titular:</span> {method.holderName}</p>
                        <p className='text-xs'><span className='font-bold'>Cuenta/Celular:</span> {method.accountNumber}</p>
                    </div>
                )}
                {method.qrImageUrl && (
                    <div className="space-y-2">
                        <p className='text-[10px] font-medium text-muted-foreground uppercase tracking-wider'>Escanea el código QR</p>
                        <div className="relative w-40 h-40 mx-auto border-2 border-primary/10 rounded-lg overflow-hidden p-1 bg-white">
                            <Image
                                src={method.qrImageUrl}
                                alt={`Código QR de ${methodName}`}
                                width={160}
                                height={160}
                                className="object-contain w-full h-full"
                            />
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}


const WhatsAppIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-5 w-5"
    >
      <path d="M16.6 14.2c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.7-.8.9-.1.1-.3.2-.5.1-.2-.1-.9-.3-1.8-1.1-.7-.6-1.1-1.4-1.3-1.6-.1-.2 0-.4.1-.5.1-.1.2-.2.4-.4.1-.1.2-.2.4-.4.1-.1.2-.2.3-.4.1-.1.1-.3 0-.4-.1-.1-.6-1.4-.8-2-.2-.5-.4-.5-.5-.5h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2 1 2.3c.1.1 1.5.7 3.5 2.6.5.4 1.2.7 1.6.9.7.3 1.3.3 1.8.2.5-.2 1.5-1 1.7-1.9.3-.9.3-1.6.2-1.8-.1-.3-.3-.4-.5-.5z M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z" />
    </svg>
);


export function CartCheckoutModal() {
  const { isOpen, onClose } = useCartModal();
  const {
    state,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
  } = useCart();
  
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);

  const firestore = useFirestore();

  // Extraemos el businessId del primer item del carrito
  const businessId = useMemo(() => {
    if (state.items && state.items.length > 0) {
      return state.items[0].businessId;
    }
    return null;
  }, [state.items]);

  // Referencia al documento de configuración de pagos del negocio
  const settingsDocRef = useMemo(() => {
    if (!firestore || !businessId) return null;
    return doc(firestore, 'paymentSettings', businessId);
  }, [firestore, businessId]);

  const { data: paymentSettings, isLoading: isLoadingSettings, error: settingsError } = useDoc<PlanPaymentSettings>(settingsDocRef);

  // LOG DE DEBUG PARA EL DESARROLLADOR (OCULTO AL USUARIO)
  useEffect(() => {
    if (isOpen && businessId) {
        console.log(`[Checkout]: Cargando pagos para el negocio ${businessId}`);
    }
  }, [isOpen, businessId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  const handleCheckout = () => {
    const orderSummary = state.items.map(item => `${item.quantity} x ${item.name} - ${formatCurrency(item.price * item.quantity)}`).join('\n');
    const message = `*¡Nuevo Pedido!* 🎉\n\n*Cliente:* ${customerName}\n*Teléfono:* ${customerPhone}\n*Dirección:* ${customerAddress}\n\n*Productos:*\n${orderSummary}\n\n*Método de Pago:* ${selectedPaymentMethod}\n*Total:* ${formatCurrency(totalPrice)}`;
    
    // Fallback de número de WhatsApp
    const whatsappNumber = 
        paymentSettings?.bancolombia?.phone || 
        paymentSettings?.nequi?.phone || 
        paymentSettings?.daviplata?.phone || 
        '346383138464218'; // Número por defecto si no hay configurado

    const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\+/g, '').replace(/\s/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    clearCart();
    onClose();
  }

  const selectedMethodDetails = useMemo(() => {
    if (!selectedPaymentMethod || !paymentSettings) return undefined;

    const normalizedMethod = selectedPaymentMethod.toLowerCase().trim();

    const methodKeyMap: { [key: string]: keyof PlanPaymentSettings } = {
        'nequi': 'nequi',
        'daviplata': 'daviplata',
        'bancolombia': 'bancolombia',
        'pago contra entrega': 'cashOnDelivery',
        'cashondelivery': 'cashOnDelivery',
        'wompi': 'wompi',
        'stripe': 'stripe',
        'mercado pago': 'mercadoPago',
        'paypal': 'paypal'
    };

    const key = methodKeyMap[normalizedMethod];

    if (!key || key === 'cashOnDelivery') return undefined;

    const methodData = paymentSettings[key];
    
    if (methodData && typeof methodData === 'object' && 'enabled' in methodData) {
        return {
            method: methodData as QRFormData,
            methodName: key
        };
    }

    return undefined;

}, [selectedPaymentMethod, paymentSettings]);


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-xl">
        <DialogHeader className="p-6 bg-primary text-primary-foreground">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <ShoppingCart className="h-6 w-6" />
            Tu Carrito
          </DialogTitle>
          <DialogDescription className="text-primary-foreground/80">
            Completa tu información para finalizar tu pedido.
          </DialogDescription>
        </DialogHeader>

        {totalItems > 0 ? (
          <ScrollArea className="max-h-[70vh] p-6">
            <div className="space-y-6">
              <div className="space-y-4">
                {state.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 group">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border">
                        <Image
                        src={item.imageUrls[0]}
                        alt={item.name}
                        fill
                        className="object-cover"
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{item.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 rounded-full"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 rounded-full"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="font-bold text-sm">{formatCurrency(item.price * item.quantity)}</p>
                       <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors" 
                        onClick={() => removeItem(item.id)}
                       >
                        <Trash2 className="h-4 w-4"/>
                       </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />
              
              <div className="flex justify-between items-center py-2">
                <span className="text-lg font-bold">Total a Pagar</span>
                <span className="text-2xl font-black text-primary">{formatCurrency(totalPrice)}</span>
              </div>

              <Accordion type="single" collapsible defaultValue="customer-info" className="w-full">
                <AccordionItem value="customer-info" className="border rounded-lg px-4 mb-3">
                  <AccordionTrigger className="hover:no-underline py-3">
                      <div className="flex items-center gap-3">
                          <User className="h-5 w-5 text-primary" />
                          <span className="font-semibold">Tus Datos</span>
                      </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-2 pb-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre Completo</Label>
                      <Input id="name" placeholder="Ej: Juan Pérez" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
                    </div>
                     <div className="space-y-2">
                      <Label htmlFor="phone">WhatsApp de contacto</Label>
                      <Input id="phone" type="tel" placeholder="3001234567" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Dirección de Entrega</Label>
                      <Textarea id="address" placeholder="Calle, Barrio, Apartamento..." value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} required />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="payment-options" className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline py-3">
                      <div className="flex items-center gap-3">
                          <Wallet className="h-5 w-5 text-primary"/>
                          <span className="font-semibold">Método de Pago</span>
                      </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4">
                    <PaymentOptionsDisplay 
                      settings={paymentSettings || null} 
                      isLoading={isLoadingSettings}
                      selectedValue={selectedPaymentMethod}
                      onValueChange={setSelectedPaymentMethod}
                    />
                     {selectedMethodDetails && (
                        <DetailsCard 
                            method={selectedMethodDetails.method} 
                            methodName={selectedMethodDetails.methodName} 
                        />
                     )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </ScrollArea>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center p-6">
            <div className="bg-muted h-20 w-20 rounded-full flex items-center justify-center mb-4">
                <ShoppingCart className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">Tu carrito está vacío</p>
            <DialogClose asChild>
                <Button variant="link" className="mt-2">Seguir comprando</Button>
            </DialogClose>
          </div>
        )}

        <DialogFooter className="p-6 bg-muted/30 border-t">
          {totalItems > 0 ? (
            <div className="w-full flex flex-col sm:flex-row gap-3">
               <Button variant="outline" onClick={clearCart} className="sm:flex-1 border-destructive text-destructive hover:bg-destructive/10">
                <Trash2 className="mr-2 h-4 w-4" />
                Vaciar
              </Button>
              <Button 
                onClick={handleCheckout} 
                className="sm:flex-[2] bg-[#25D366] hover:bg-[#25D366]/90 text-white font-bold"
                disabled={!customerName || !customerPhone || !customerAddress || !selectedPaymentMethod}
              >
                <WhatsAppIcon />
                <span className="ml-2">Enviar Pedido</span>
              </Button>
            </div>
          ) : (
            <DialogClose asChild>
              <Button variant="secondary" className="w-full">Cerrar</Button>
            </DialogClose>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}