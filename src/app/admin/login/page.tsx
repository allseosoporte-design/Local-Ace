'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { useAuth, useFirestore } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { LocalLeap } from '@/components/icons';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getIdTokenResult } from 'firebase/auth';

const SUPER_ADMIN_EMAIL = 'allseosoporte@gmail.com';

export default function AdminLoginPage() {
  const [email, setEmail] = useState(SUPER_ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!auth || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Servicio de autenticación no disponible.',
      });
      setIsLoading(false);
      return;
    }

    if (email.toLowerCase() !== SUPER_ADMIN_EMAIL) {
      toast({
        variant: 'destructive',
        title: 'Acceso Denegado',
        description: 'Esta página es solo para el superadministrador.',
      });
      setIsLoading(false);
      return;
    }

    try {
      // Intentar iniciar sesión
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Forzar la recarga del token para obtener los últimos claims
      const tokenResult = await getIdTokenResult(user, true);
      
      if (tokenResult.claims.isSuperAdmin !== true) {
        toast({
          variant: 'destructive',
          title: 'Configuración de Permisos Requerida',
          duration: 10000,
          description: 'Tu cuenta no tiene el rol de Super Admin. Por favor, contacta al desarrollador para que ejecute el script de configuración del servidor.',
        });
        await auth.signOut(); // Cerrar sesión si no es admin
        setIsLoading(false);
        return;
      }

      toast({
        title: '¡Bienvenido de nuevo!',
        description: 'Acceso de superadministrador concedido.',
      });
      
      router.push('/dashboard/admin');

    } catch (error: any) {
      // Si el usuario no existe, crearlo para que el script de admin pueda encontrarlo
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        try {
          toast({
            title: 'Creando cuenta de Super Admin...',
            description: 'La cuenta se creará. A continuación, el rol debe ser asignado manualmente.',
          });

          await createUserWithEmailAndPassword(auth, email, password);
          
          toast({
            variant: 'destructive',
            title: 'Acción Requerida',
            duration: 10000,
            description: 'Cuenta creada. Ahora un administrador debe asignarte el rol de Super Admin usando el script del servidor antes de que puedas iniciar sesión.',
          });

          if(auth.currentUser) {
            await auth.signOut();
          }

        } catch (creationError: any) {
          console.error('Error creando cuenta de superadmin:', creationError);
          toast({
            variant: 'destructive',
            title: 'Error al crear cuenta',
            description: `No se pudo crear la cuenta: ${creationError.message}`,
          });
        }
      } else if (error.code === 'auth/wrong-password') {
        toast({
          variant: 'destructive',
          title: 'Contraseña incorrecta',
          description: 'Verifica tu contraseña e intenta nuevamente.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error de autenticación',
          description: error.message || 'No se pudo iniciar sesión.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <Link href="/" className="flex justify-center items-center">
            <LocalLeap className="w-12 h-12 mx-auto text-primary" />
          </Link>
          <CardTitle className="text-2xl font-bold mt-4">Acceso de Administrador</CardTitle>
          <CardDescription>Inicia sesión como Super Admin.</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                value={email}
                readOnly
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Verificando...' : 'Entrar'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}