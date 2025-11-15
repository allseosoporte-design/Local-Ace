'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
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
import { useUser, useFirestore } from '@/firebase';
import { uploadImage } from '@/ai/flows/upload-image';
import { Loader2, Upload, Save } from 'lucide-react';
import { PaymentPlanForm } from '@/components/payment-plan-form';
import type { PlanPaymentSettings } from '@/types/payment-settings';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';

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

const initialPayPalData = { enabled: false, clientId: '', clientSecret: '', mode: 'sandbox' as 'production' | 'sandbox'};

const initialWompiData = { enabled: false, publicKey: '', privateKey: '', mode: 'sandbox' as 'production' | 'sandbox'};

const initialPlanSettings: PlanPaymentSettings = {
    nequi: initialQRData,
    bancolombia: initialQRData,
    daviplata: initialQRData,
    stripe: initialStripeData,
    mercadoPago: initialMercadoPagoData,
    paypal: initialPayPalData,
    wompi: initialWompiData,
    cashOnDelivery: false,
};


export default function SettingsPage() {
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const firestore = useFirestore();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [isUploading, setIsUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.photoURL || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [paymentSettings, setPaymentSettings] = useState<PlanPaymentSettings>(initialPlanSettings);
  const [isSavingPayments, setIsSavingPayments] = useState(false);
  const [isLoadingPayments, setIsLoadingPayments] = useState(true);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setAvatarPreview(user.photoURL || null);
    }
  }, [user]);

  const settingsDocRef = useMemo(() => {
      if (!firestore || !user) return null;
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
                    ...initialPlanSettings,
                    ...loadedData,
                    nequi: { ...initialQRData, ...(loadedData.nequi || {}) },
                    bancolombia: { ...initialQRData, ...(loadedData.bancolombia || {}) },
                    daviplata: { ...initialQRData, ...(loadedData.daviplata || {}) },
                    stripe: { ...initialStripeData, ...(loadedData.stripe || {}) },
                    mercadoPago: { ...initialMercadoPagoData, ...(loadedData.mercadoPago || {}) },
                    paypal: { ...initialPayPalData, ...(loadedData.paypal || {}) },
                    wompi: { ...initialWompiData, ...(loadedData.wompi || {}) },
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
    if (!user || !firestore) return;
    
    setIsUploading(true);
    toast({ title: "Guardando perfil..." });

    try {
      let newPhotoUrl = user.photoURL;
      const file = fileInputRef.current?.files?.[0];

      // Si hay un nuevo archivo y una previsualización de data URL
      if (file && avatarPreview && avatarPreview.startsWith('data:')) {
        const result = await uploadImage({
          fileAsDataUrl: avatarPreview,
          folder: `avatars/${user.uid}`
        });
        newPhotoUrl = result.imageUrl;
        setAvatarPreview(newPhotoUrl); 
      }
      
      // Actualizar perfil de Firebase Auth si hay cambios
      if (user.displayName !== displayName || user.photoURL !== newPhotoUrl) {
          await updateProfile(user, {
            displayName: displayName,
            photoURL: newPhotoUrl,
          });
      }

      // Actualizar el documento del negocio en Firestore
      const businessRef = doc(firestore, 'businesses', user.uid);
      await updateDoc(businessRef, {
          name: displayName,
          updatedAt: serverTimestamp()
      });

      await user.reload(); // Recargar datos del usuario para reflejar cambios

      toast({ title: "¡Perfil guardado!", description: "Tu información ha sido actualizada." });

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
  
  if (isUserLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin"/></div>
  }

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
            <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input id="email" type="email" value={user?.email || ""} disabled />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveProfile} disabled={isUploading}>
             {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
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
            <Input id="business-name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
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
          <Button onClick={handleSaveProfile} disabled={isUploading}>
            {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Guardar Configuración del Negocio
            </Button>
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

    </div>
  );
}

    