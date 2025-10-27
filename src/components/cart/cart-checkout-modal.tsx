
'use client';

import { useState, useMemo } from 'react';
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

const DetailsCard = ({ method, methodName }: { method: QRFormData | undefined, methodName: string }) => {
    if (!method || !method.enabled) {
        return null;
    }

    // Hide for cash on delivery
    if (methodName === 'cashOnDelivery') {
        return null;
    }
    
    // Only show if there's something to show (QR or account details)
    if (!method.qrImageUrl && (!method.holderName || !method.accountNumber)) {
        return null;
    }

    return (
        <Card className="mt-4 bg-white animate-in fade-in-50">
            <CardHeader>
                <CardTitle className='text-base'>Paga a la siguiente cuenta:</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
                {method.holderName && method.accountNumber && (
                    <div className='text-left space-y-2'>
                        <p><span className='font-semibold'>Titular:</span> {method.holderName}</p>
                        <p><span className='font-semibold'>Cuenta:</span> {method.accountNumber}</p>
                    </div>
                )}
                {method.qrImageUrl && (
                    <>
                        <p className='font-semibold text-center mt-2'>O escanea el código QR:</p>
                        <div className="relative w-[200px] h-[200px] mx-auto">
                            <Image
                                src={method.qrImageUrl}
                                alt={`Código QR de ${methodName}`}
                                width={200}
                                height={200}
                                className="rounded-md object-contain"
                            />
                        </div>
                    </>
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
      <path d="M16.6 14.2c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.7-.8.9-.1.1-.3.2-.5.1-.2-.1-.9-.3-1.8-1.1-.7-.6-1.1-1.4-1.3-1.6-.1-.2 0-.4.1-.5.1-.1.2-.2.4-.4.1-.1.2-.2.3-.4.1-.1.1-.3 0-.4-.1-.1-.6-1.4-.8-2-.2-.5-.4-.5-.5-.5h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2 1 2.3c.1.1 1.5.7 3.5 2.6.5.4 1.2.7 1.6.9.7.3 1.3.3 1.8.2.5-.2 1.5-1 1.7-1.9.3-.9.3-1.6.2-1.8-.1-.3-.3-.4-.5-.5z M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z" />
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

  const businessId = useMemo(() => {
    if (state.items.length > 0) {
      return state.items[0].businessId;
    }
    return null;
  }, [state.items]);

  const settingsDocRef = useMemo(() => {
    if (!firestore || !businessId || !isOpen) return null;
    return doc(firestore, 'paymentSettings', businessId);
  }, [firestore, businessId, isOpen]);

  const { data: paymentSettings, isLoading: isLoadingSettings } = useDoc<PlanPaymentSettings>(settingsDocRef);


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
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    clearCart();
    onClose();
  }

  const selectedMethodDetails = useMemo(() => {
    if (!selectedPaymentMethod || !paymentSettings) return undefined;

    // Normalizar el nombre del método seleccionado a minúsculas
    const normalizedMethod = selectedPaymentMethod.toLowerCase().trim();

    // Mapeo directo a las claves de paymentSettings
    const methodKeyMap: { [key: string]: keyof PlanPaymentSettings } = {
        'nequi': 'nequi',
        'daviplata': 'daviplata',
        'bancolombia': 'bancolombia',
        'pago contra entrega': 'cashOnDelivery',
        'cashondelivery': 'cashOnDelivery'
    };

    const key = methodKeyMap[normalizedMethod];

    if (!key) return undefined;

    // Para cashOnDelivery no mostrar detalles
    if (key === 'cashOnDelivery') return undefined;

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-6 w-6" />
            Tu Carrito
          </DialogTitle>
          <DialogDescription>
            Revisa tus productos y completa la información para finalizar tu
            pedido.
          </DialogDescription>
        </DialogHeader>

        {totalItems > 0 ? (
          <>
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-4">
                {state.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <Image
                      src={item.imageUrls[0]}
                      alt={item.name}
                      width={64}
                      height={64}
                      className="rounded-md object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span>{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                       <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => removeItem(item.id)}><Trash2 className="h-4 w-4"/></Button>
                    </div>
                  </div>
                ))}
              </div>
              <Separator className='my-4' />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>

              <Accordion type="single" collapsible defaultValue="customer-info" className="w-full">
                <AccordionItem value="customer-info">
                  <AccordionTrigger>
                      <div className="flex items-center gap-2">
                          <User className="h-5 w-5" />
                          Información del Cliente
                      </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre Completo</Label>
                      <Input id="name" placeholder="John Doe" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
                    </div>
                     <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input id="phone" type="tel" placeholder="3001234567" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Dirección de Entrega</Label>
                      <Textarea id="address" placeholder="Calle 123 #45-67, Apto 89" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} required />
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="payment-options">
                  <AccordionTrigger>
                      <div className="flex items-center gap-2">
                          <Wallet className="h-5 w-5"/>
                          Opciones de Pago
                      </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <PaymentOptionsDisplay 
                      settings={paymentSettings} 
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
            </ScrollArea>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <ShoppingCart className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Tu carrito está vacío</p>
          </div>
        )}

        <DialogFooter>
          {totalItems > 0 && (
            <div className="w-full flex justify-between gap-2">
               <Button variant="outline" onClick={clearCart}>
                <Trash2 className="mr-2 h-4 w-4" />
                Vaciar Carrito
              </Button>
              <Button onClick={handleCheckout} disabled={!customerName || !customerPhone || !customerAddress || !selectedPaymentMethod}>
                <WhatsAppIcon />
                <span className="ml-2">Pedir por WhatsApp</span>
              </Button>
            </div>
          )}
          <DialogClose asChild>
            <Button variant="ghost" className={totalItems === 0 ? 'w-full' : 'hidden'}>Cerrar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
