
'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { uploadImage } from '@/ai/flows/upload-image';
import { Loader2, UploadCloud, Save, RotateCcw } from 'lucide-react';
import type { CatalogHeaderConfigData, SocialLinks } from '@/types/catalog';
import {
  Twitter,
  Instagram,
  Facebook,
  MessageCircle,
} from 'lucide-react';

const TikTokIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71v-2.3c.94.39 1.96.61 2.99.62.67.01 1.34-.09 1.98-.28 1.3-.38 2.44-.95 3.39-1.76.49-.42.92-.91 1.29-1.47.01-1.54.01-3.08.01-4.63h-4.69v-4.03h4.69c.01-1.13.02-2.26.01-3.39z"></path>
  </svg>
);

const socialIcons = {
  tiktok: <TikTokIcon />,
  instagram: <Instagram />,
  facebook: <Facebook />,
  whatsapp: <MessageCircle />,
  twitter: <Twitter />,
};

const defaultValues: CatalogHeaderConfigData = {
  bannerUrl: '',
  businessName: '',
  address: '',
  phone: '',
  email: '',
  socialLinks: {
    tiktok: '',
    instagram: '',
    facebook: '',
    whatsapp: '',
    twitter: '',
  },
};

export function CatalogHeaderConfig() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [config, setConfig] = useState<CatalogHeaderConfigData>(defaultValues);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const configDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, `businesses/${user.uid}/catalogConfig/header`);
  }, [firestore, user]);

  const { data: initialData, isLoading: isLoadingDoc } = useDoc<CatalogHeaderConfigData>(configDocRef);

  useEffect(() => {
    if (!isUserLoading) {
        if (initialData) {
            setConfig(prev => ({...prev, ...initialData, socialLinks: {...prev.socialLinks, ...initialData.socialLinks}}));
        } else if (!isLoadingDoc) {
            setConfig(defaultValues);
        }
    }
    setIsLoading(isUserLoading || isLoadingDoc);
  }, [initialData, isLoadingDoc, isUserLoading]);
  

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setConfig(prev => ({ ...prev, [id]: value }));
  };

  const handleSocialChange = (platform: keyof SocialLinks, value: string) => {
    setConfig(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, [platform]: value }}));
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    setIsUploading(true);
    try {
        const fileAsDataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });

        const result = await uploadImage({ fileAsDataUrl, folder: `catalog_banners/${user.uid}` });
        
        if (result.imageUrl) {
            setConfig(prev => ({ ...prev, bannerUrl: result.imageUrl }));
            toast({ title: 'Banner actualizado', description: 'La nueva imagen del banner se ha subido.' });
        }
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo subir la imagen.' });
    } finally {
        setIsUploading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!configDocRef) return;
    setIsSaving(true);
    try {
        await setDoc(configDocRef, { ...config, updatedAt: serverTimestamp() }, { merge: true });
        toast({ title: 'Configuración guardada', description: 'El encabezado del catálogo ha sido actualizado.' });
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo guardar la configuración.' });
    } finally {
        setIsSaving(false);
    }
  };

  const handleReset = () => {
    setConfig(initialData || defaultValues);
    toast({ title: 'Cambios descartados', description: 'Se ha restaurado la configuración guardada.' });
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle>Configurar Encabezado del Catálogo</CardTitle></CardHeader>
        <CardContent className='flex justify-center items-center h-32'><Loader2 className="h-8 w-8 animate-spin" /></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle>Configurar Encabezado del Catálogo</CardTitle>
                <CardDescription>Personaliza la cabecera que se mostrará en tu catálogo público.</CardDescription>
            </div>
            <div className='flex gap-2'>
                <Button variant="outline" onClick={handleReset} disabled={isSaving}><RotateCcw className="mr-2 h-4 w-4"/> Restablecer</Button>
                <Button onClick={handleSaveChanges} disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Guardar Cambios
                </Button>
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
            <Label>Banner del Catálogo</Label>
            <div className="relative aspect-[3/1] w-full bg-muted rounded-lg border-2 border-dashed flex items-center justify-center" onClick={() => fileInputRef.current?.click()}>
                 <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/jpeg,image/png,image/webp" />
                 {isUploading ? <Loader2 className="h-8 w-8 animate-spin" /> : (
                    config.bannerUrl ? (
                        <Image src={config.bannerUrl} alt="Banner preview" fill className="object-cover rounded-md"/>
                    ) : (
                        <div className='text-center text-muted-foreground'>
                            <UploadCloud className="mx-auto h-8 w-8"/>
                            <p>Haz clic para subir una imagen (1200x400 recomendado)</p>
                        </div>
                    )
                 )}
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
                <Label htmlFor="businessName">Nombre del Negocio</Label>
                <Input id="businessName" value={config.businessName} onChange={handleInputChange} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Input id="address" value={config.address} onChange={handleInputChange} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="phone">Teléfono / WhatsApp</Label>
                <Input id="phone" type="tel" value={config.phone} onChange={handleInputChange} />
            </div>
            <div className="space-y-2 lg:col-span-3">
                <Label htmlFor="email">Correo Electrónico (opcional)</Label>
                <Input id="email" type="email" value={config.email} onChange={handleInputChange} />
            </div>
        </div>
        <div className="space-y-2">
            <Label>Redes Sociales</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {Object.entries(socialIcons).map(([key, icon]) => (
                    <div className="relative" key={key}>
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">{icon}</div>
                        <Input 
                            id={key}
                            placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                            className="pl-10"
                            value={config.socialLinks[key as keyof SocialLinks]}
                            onChange={(e) => handleSocialChange(key as keyof SocialLinks, e.target.value)}
                        />
                    </div>
                ))}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
