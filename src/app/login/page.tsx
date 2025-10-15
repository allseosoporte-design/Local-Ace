
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
import { signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
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

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const batch = writeBatch(firestore);

      const userProfileRef = doc(firestore, 'users', user.uid);
      const userProfileDoc = await getDoc(userProfileRef);

      const isSuperAdmin = user.email === 'allseosoporte@gmail.com';

      if (isSuperAdmin) {
        if (!userProfileDoc.exists()) {
            batch.set(userProfileRef, {
                businessId: 'allseosoporte',
                email: user.email,
            });
        }
        router.push('/dashboard/admin');
      } else {
        if (!userProfileDoc.exists()) {
           batch.set(userProfileRef, {
                businessId: user.uid,
                email: user.email,
            });
        }
        
        const businessRef = doc(firestore, 'businesses', user.uid);
        const businessDoc = await getDoc(businessRef);

        if (!businessDoc.exists()) {
          batch.set(businessRef, {
            name: user.displayName || user.email,
            adminEmail: user.email,
            status: "Active",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
        router.push('/dashboard');
      }
      
      await batch.commit();

    } catch (error: any) {
      let errorMessage = 'Credenciales incorrectas. Por favor, inténtalo de nuevo.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
          errorMessage = 'El correo electrónico o la contraseña son incorrectos.';
      }
      toast({
        variant: 'destructive',
        title: 'Error de inicio de sesión',
        description: errorMessage,
      });
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
