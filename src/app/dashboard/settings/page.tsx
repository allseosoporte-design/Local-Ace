
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { uploadImage } from '@/ai/flows/upload-image';
import { Loader2, Upload, Save } from 'lucide-react';
import { PaymentPlanForm } from '@/components/payment-plan-form';
import type { PlanPaymentSettings } from '@/types/payment-settings';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const initialQRData = {
  enabled: false,
  qrImageUrl: null,
  accountNumber: '',
  holderName: '',
  idDocument: '',
  phone: '',
  isMainQR: false,
  instructions: '',
};

const initialStripeData = { enabled: false, publicKey: '', secretKey: '' };

const initialMercadoPagoData = { enabled: false, accessToken: '', publicKey: '', mode: 'production' as 'production' | 'sandbox', instructions: '' };

const initialPlanSettings: PlanPaymentSettings = {
    nequi: initialQRData,
    bancolombia: initialQRData,
    daviplata: initialQRData,
    stripe: initialStripeData,
    mercadoPago: initialMercadoPagoData,
    cashOnDelivery: false,
};


export default function SettingsPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const firestore = useFirestore();

  const [isUploading, setIsUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.photoURL || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [paymentSettings, setPaymentSettings] = useState<PlanPaymentSettings>(initialPlanSettings);
  const [isSavingPayments, setIsSavingPayments] = useState(false);
  const [isLoadingPayments, setIsLoadingPayments] = useState(true);

  const settingsDocRef = useMemoFirebase(() => {
      if (!firestore || !user) return null;
      // Using a single document for the business's payment settings.
      return doc(firestore, 'paymentSettings', user.uid);
  }, [firestore, user]);

  useEffect(() => {
    const loadSettings = async () => {
        if (!settingsDocRef) {
            setIsLoadingPayments(false);
            return;
        };
        setIsLoadingPayments(true);
        try {
            const docSnap = await getDoc(settingsDocRef);
            if (docSnap.exists()) {
                const loadedData = docSnap.data() as PlanPaymentSettings;
                 const mergedSettings = {
                    nequi: { ...initialQRData, ...(loadedData.nequi || {}) },
                    bancolombia: { ...initialQRData, ...(loadedData.bancolombia || {}) },
                    daviplata: { ...initialQRData, ...(loadedData.daviplata || {}) },
                    stripe: { ...initialStripeData, ...(loadedData.stripe || {}) },
                    mercadoPago: { ...initialMercadoPagoData, ...(loadedData.mercadoPago || {}) },
                    cashOnDelivery: loadedData.cashOnDelivery || false,
                };
                setPaymentSettings(mergedSettings);
            } else {
                 setPaymentSettings(initialPlanSettings);
            }
        } catch (error) {
            console.error("Error loading payment settings:", error);
            setPaymentSettings(initialPlanSettings);
        } finally {
            setIsLoadingPayments(false);
        }
    };
    loadSettings();
  }, [settingsDocRef]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    setIsUploading(true);
    toast({ title: "Guardando perfil..." });

    const file = fileInputRef.current?.files?.[0];

    try {
      if (file && avatarPreview && avatarPreview.startsWith('data:')) {
        const result = await uploadImage({
          fileAsDataUrl: avatarPreview,
          folder: `avatars/${user?.uid}`
        });
        setAvatarPreview(result.imageUrl);
        toast({ title: "¡Perfil guardado!", description: "Tu foto de perfil ha sido actualizada." });
      } else {
        toast({ title: "¡Perfil guardado!", description: "Tu información ha sido actualizada." });
      }

    } catch (error) {
      console.error("Error saving profile:", error);
      toast({ variant: 'destructive', title: "Error", description: "No se pudo guardar el perfil." });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSavePaymentSettings = async () => {
    if (!settingsDocRef) {
      toast({ variant: "destructive", title: "Error", description: "No se puede conectar a la base de datos." });
      return;
    }
    setIsSavingPayments(true);
    try {
      await setDoc(settingsDocRef, { ...paymentSettings, updatedAt: serverTimestamp() }, { merge: true });
      toast({ title: 'Configuración guardada', description: 'Los ajustes de pago han sido actualizados.' });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: "No se pudo guardar la configuración." });
    } finally {
      setIsSavingPayments(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Configuración</h1>
        <p className="text-muted-foreground">
          Gestiona tu cuenta, negocio y configuración de pagos.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
          <CardDescription>Actualiza tu información personal.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2 flex flex-col items-center sm:items-start">
            <Label>Avatar</Label>
            <div className='flex items-center gap-4'>
              <Avatar className="h-20 w-20">
                <AvatarImage src={avatarPreview || undefined} alt="Avatar" />
                <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
               <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />
              <Button variant="outline" onClick={handleUploadClick}>
                <Upload className="mr-2 h-4 w-4" />
                Cambiar Foto
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nombre Completo</Label>
            <Input id="name" defaultValue={user?.displayName || "John Doe"} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input id="email" type="email" defaultValue={user?.email || "john.doe@example.com"} disabled />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveProfile} disabled={isUploading}>
             {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Guardar Perfil
          </Button>
        </CardFooter>
      </Card>
      
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Negocio</CardTitle>
          <CardDescription>Gestiona los detalles de tu negocio y las opciones de marca blanca.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="business-name">Nombre del Negocio</Label>
            <Input id="business-name" defaultValue="The Cozy Corner Cafe" />
          </div>
           <div className="space-y-2">
            <Label htmlFor="language">Idioma</Label>
            <Select defaultValue="es">
              <SelectTrigger id="language">
                <SelectValue placeholder="Seleccionar idioma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label htmlFor="white-label" className="font-semibold">Modo Marca Blanca</Label>
              <p className="text-sm text-muted-foreground">
                Para que las agencias ofrezcan esta plataforma bajo su propia marca.
              </p>
            </div>
            <Switch id="white-label" />
          </div>
        </CardContent>
        <CardFooter>
          <Button>Guardar Configuración del Negocio</Button>
        </CardFooter>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Opciones de Pago Disponibles</CardTitle>
          <CardDescription>Configura los métodos de pago que aceptarás de tus clientes.</CardDescription>
        </CardHeader>
        <CardContent>
          <PaymentPlanForm 
              isLoading={isLoadingPayments} 
              settings={paymentSettings} 
              setSettings={setPaymentSettings} 
            />
        </CardContent>
        <CardFooter>
            <Button size="lg" onClick={handleSavePaymentSettings} disabled={isSavingPayments || isLoadingPayments}>
                {isSavingPayments ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Guardar Métodos de Pago
            </Button>
        </CardFooter>
      </Card>
      
      <Separator />

       <Card>
        <CardHeader>
          <CardTitle>Facturación y Suscripción</CardTitle>
          <CardDescription>Gestiona tu plan de suscripción y métodos de pago.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="rounded-lg border bg-card text-card-foreground p-4">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-semibold">Plan Pro</p>
                        <p className="text-sm text-muted-foreground">$49.99 / mes</p>
                    </div>
                    <Button variant="outline">Cambiar Plan</Button>
                </div>
                <Separator className="my-4" />
                <p className="text-sm text-muted-foreground">Próximo pago el 1 de Dic, 2024.</p>
            </div>
        </CardContent>
      </Card>

    </div>
  );
}

    