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
import { getFunctions, httpsCallable } from 'firebase/functions';
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

    const functions = getFunctions(auth.app);
    const addSuperAdminRole = httpsCallable(functions, 'addSuperAdminRole');

    try {
      // Intentar iniciar sesión
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Verificar si ya tiene el claim
      const tokenResult = await getIdTokenResult(user, true);
      
      if (!tokenResult.claims.isSuperAdmin) {
        toast({
          title: 'Configurando permisos...',
          description: 'Asignando rol de superadministrador.',
        });

        // Llamar a la función para asignar el rol
        await addSuperAdminRole({ email: user.email });
        
        // Forzar actualización del token
        await user.getIdToken(true);
        
        // Esperar un momento para que se propague
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      toast({
        title: '¡Bienvenido!',
        description: 'Acceso concedido.',
      });
      
      router.push('/dashboard/admin');

    } catch (error: any) {
      // Si el usuario no existe, crearlo
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        try {
          toast({
            title: 'Creando cuenta...',
            description: 'Configurando superadministrador por primera vez.',
          });

          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;

          // Crear documento en Firestore
          const superAdminRef = doc(firestore, 'superAdmins', user.uid);
          await setDoc(superAdminRef, {
            id: user.uid,
            firstName: 'Super',
            lastName: 'Admin',
            email: user.email,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });

          // Asignar el rol de superadmin
          await addSuperAdminRole({ email: user.email });
          
          // Forzar actualización del token
          await user.getIdToken(true);
          
          // Esperar propagación
          await new Promise(resolve => setTimeout(resolve, 1000));

          toast({
            title: '¡Cuenta creada!',
            description: 'Superadministrador configurado exitosamente.',
          });

          router.push('/dashboard/admin');

        } catch (creationError: any) {
          console.error('Error creando cuenta:', creationError);
          toast({
            variant: 'destructive',
            title: 'Error',
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
              {isLoading ? 'Verificando acceso...' : 'Entrar'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
