
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
import { SUPER_ADMIN_BUSINESS_ID } from '@/lib/constants';
import { doc, writeBatch } from 'firebase/firestore';

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
      // Intenta iniciar sesión primero
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard/admin');
    } catch (error: any) {
      // SI EL USUARIO NO EXISTE (Y ES EL SUPER ADMIN), LO CREAMOS
      if (error.code === 'auth/user-not-found') {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
          const batch = writeBatch(firestore);

          // Asegurarse de que el UID sea el constante
          if(user.uid !== SUPER_ADMIN_BUSINESS_ID) {
              console.error("CRITICAL: Super admin UID does not match constant.");
              // En un caso real, aquí habría que manejar una inconsistencia grave.
          }

          const userProfileRef = doc(firestore, 'users', user.uid);
          batch.set(userProfileRef, {
              businessId: SUPER_ADMIN_BUSINESS_ID,
              email: user.email,
          });
          
          await addSuperAdminRole({ email: user.email });
          await user.getIdToken(true); 

          await batch.commit();
          
          toast({
            title: '¡Bienvenido, Super Admin!',
            description: 'Se ha creado tu cuenta de administrador.',
          });
          router.push('/dashboard/admin');

        } catch (creationError: any) {
           toast({
            variant: 'destructive',
            title: 'Error Crítico',
            description: `No se pudo crear la cuenta de super admin: ${creationError.message}`,
          });
        }
      } else {
        let errorMessage = 'Credenciales incorrectas.';
        if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            errorMessage = 'La contraseña es incorrecta.';
        }
        toast({
          variant: 'destructive',
          title: 'Error de inicio de sesión',
          description: errorMessage,
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
              Entrar
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
