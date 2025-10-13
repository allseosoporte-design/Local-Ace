
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, Loader2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { uploadImage } from '@/ai/flows/upload-image';
import { updatePassword, updateProfile } from 'firebase/auth';
import { useAuth } from '@/firebase';

interface SuperAdminProfile {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    avatarUrl?: string;
}

export default function AdminProfilePage() {
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileData, setProfileData] = useState<Partial<SuperAdminProfile>>({});
  const [newPassword, setNewPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const superAdminRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'superAdmins', user.uid);
  }, [firestore, user]);

  const { data: initialData, isLoading: isProfileLoading } = useDoc<SuperAdminProfile>(superAdminRef);

  useEffect(() => {
    if (initialData) {
      setProfileData(initialData);
    }
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setProfileData(prev => ({ ...prev, [id]: value }));
  };

  const handleSaveChanges = async () => {
    if (!superAdminRef || !user) return;
    setIsSaving(true);
    try {
      const displayName = `${profileData.firstName} ${profileData.lastName}`.trim();
      const dataToSave: Partial<SuperAdminProfile> & { updatedAt: any } = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(superAdminRef, dataToSave);

      if (user.displayName !== displayName) {
         await updateProfile(user, { displayName });
         await user.reload();
      }

      toast({
        title: 'Cambios guardados',
        description: 'Tu información personal ha sido actualizada.',
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudieron guardar los cambios.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!user || !auth) return;
    if (!newPassword) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'La nueva contraseña no puede estar vacía.',
      });
      return;
    }
    setIsSaving(true);
    try {
      await updatePassword(user, newPassword);
      setNewPassword('');
      toast({
        title: 'Contraseña actualizada',
        description: 'Tu contraseña ha sido cambiada exitosamente.',
      });
    } catch (error: any) {
      console.error(error);
      let description = 'Ocurrió un error al actualizar la contraseña.';
      if (error.code === 'auth/requires-recent-login') {
        description = 'Esta operación requiere un inicio de sesión reciente. Por favor, cierra sesión y vuelve a iniciar sesión.';
      }
      toast({
        variant: 'destructive',
        title: 'Error de seguridad',
        description,
        duration: 7000
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user || !superAdminRef) return;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const fileAsDataUrl = reader.result as string;
        const result = await uploadImage({
          fileAsDataUrl,
          folder: `super-admins/${user.uid}`
        });

        if (result.imageUrl) {
          await updateDoc(superAdminRef, { avatarUrl: result.imageUrl });
          await updateProfile(user, { photoURL: result.imageUrl });
          await user.reload(); // Force refresh of user object
          
          toast({
            title: 'Foto actualizada',
            description: 'Tu foto de perfil se ha subido y guardado correctamente.',
          });
        }
      };
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      toast({
        variant: 'destructive',
        title: 'Error de subida',
        description: 'No se pudo subir la nueva foto de perfil.',
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const isLoading = isUserLoading || isProfileLoading;

  if (isLoading) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Perfil de Super Admin</h1>
        <p className="text-muted-foreground">
          Gestiona tu información de administrador y la configuración de la cuenta.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información Personal</CardTitle>
          <CardDescription>Actualiza los detalles de tu cuenta de administrador.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 flex flex-col items-center gap-4">
              <Avatar className="h-32 w-32">
                <AvatarImage src={user?.photoURL || profileData.avatarUrl} alt="Admin Avatar" />
                <AvatarFallback>{profileData.firstName?.charAt(0)}{profileData.lastName?.charAt(0)}</AvatarFallback>
              </Avatar>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
                disabled={isUploading}
              />
              <Button variant="outline" onClick={handleUploadClick} disabled={isUploading}>
                {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                Subir nueva foto
              </Button>
            </div>
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nombre</Label>
                  <Input id="firstName" value={profileData.firstName || ''} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellido</Label>
                  <Input id="lastName" value={profileData.lastName || ''} onChange={handleInputChange} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input id="email" type="email" value={profileData.email || ''} readOnly />
                <p className="text-xs text-muted-foreground pt-1">El correo electrónico no se puede modificar.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono de Contacto</Label>
                <Input id="phone" type="tel" value={profileData.phone || ''} onChange={handleInputChange} />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-6 flex justify-end">
          <Button onClick={handleSaveChanges} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Guardar Cambios
          </Button>
        </CardFooter>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Seguridad</CardTitle>
          <CardDescription>Gestiona la seguridad de tu cuenta.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="space-y-2">
            <Label htmlFor="new-password">Nueva Contraseña</Label>
            <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder='Introduce tu nueva contraseña' />
            <p className='text-xs text-muted-foreground'>Deja el campo en blanco si no quieres cambiar la contraseña.</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleUpdatePassword} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Actualizar Contraseña
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
