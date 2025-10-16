
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
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { LocalLeap } from '@/components/icons';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { getFunctions, httpsCallable } from 'firebase/functions';

export default function LoginPage() {
  const [email, setEmail] = useState('');
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

    const functions = getFunctions(auth.app);
    const addSuperAdminRole = httpsCallable(functions, 'addSuperAdminRole');

    try {
      // Intenta iniciar sesión primero
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user.email === 'allseosoporte@gmail.com') {
        router.push('/dashboard/admin');
      } else {
        router.push('/dashboard');
      }
      
    } catch (error: any) {
      // SI EL USUARIO NO EXISTE (Y ES EL SUPER ADMIN), LO CREAMOS
      if (error.code === 'auth/user-not-found' && email === 'allseosoporte@gmail.com') {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
          const batch = writeBatch(firestore);

          // Crear perfil de usuario
          const userProfileRef = doc(firestore, 'users', user.uid);
          batch.set(userProfileRef, {
              businessId: 'allseosoporte',
              email: user.email,
          });

          // Asignar el custom claim de super admin
          await addSuperAdminRole({ email: user.email });
          // Forzar la actualización del token para que el claim se refleje
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
        // Manejar otros errores de login
        let errorMessage = 'Credenciales incorrectas. Por favor, inténtalo de nuevo.';
        if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            errorMessage = 'La contraseña es incorrecta.';
        } else if (error.code === 'auth/user-not-found') {
            errorMessage = 'El usuario no existe. Por favor, regístrate.';
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
          <CardTitle className="text-2xl font-bold mt-4">Bienvenido de Nuevo</CardTitle>
          <CardDescription>Inicia sesión para gestionar tu negocio.</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@ejemplo.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Iniciar Sesión
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              ¿No tienes una cuenta?{' '}
              <Link href="/register" className="underline hover:text-primary">
                Regístrate
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
