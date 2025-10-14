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
import { createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { LocalLeap } from '@/components/icons';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { getFunctions, httpsCallable } from 'firebase/functions';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleRegisterOrAssignRole = async (e: React.FormEvent) => {
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

    const emailLower = email.toLowerCase().trim();

    if (emailLower === 'allseosoporte@gmail.com') {
      try {
        // Step 1: Sign in the user to ensure they are authenticated
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Step 2: Call the Cloud Function to assign the super admin role
        const functions = getFunctions(auth.app);
        const addSuperAdminRole = httpsCallable(functions, 'addSuperAdminRole');
        await addSuperAdminRole({ email: user.email });

        // Step 3: Ensure the superadmin doc exists
        const superAdminRef = doc(firestore, 'superAdmins', user.uid);
        await setDoc(superAdminRef, {
            id: user.uid,
            email: user.email,
            firstName: 'Alexander',
            lastName: 'Jerez Fernandez',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        }, { merge: true }); // Use merge to avoid overwriting existing data if any
        
        await updateProfile(user, { displayName: 'Alexander Jerez Fernandez' });


        toast({
          title: '¡Rol de SuperAdmin asignado!',
          description: 'Cierra sesión y vuelve a iniciarla para que los cambios tomen efecto.',
          duration: 7000,
        });

        router.push('/dashboard/admin');

      } catch (error: any) {
        let errorMessage = 'Ocurrió un error al asignar el rol. ¿Las credenciales son correctas?';
        if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
          errorMessage = 'La contraseña es incorrecta.';
        }
        console.error('Error assigning super admin role:', error);
        toast({
          variant: 'destructive',
          title: 'Error al Asignar Rol',
          description: errorMessage,
        });
      }
    } else {
      // Standard user registration
      try {
        await createUserWithEmailAndPassword(auth, email, password);
        toast({
          title: '¡Registro exitoso!',
          description: 'Tu cuenta ha sido creada. Ahora puedes iniciar sesión.',
        });
        router.push('/login');
      } catch (error: any) {
        let errorMessage = 'Ocurrió un error durante el registro. Por favor, inténtalo de nuevo.';
        if (error.code === 'auth/email-already-in-use') {
          errorMessage = 'Este correo electrónico ya está en uso.';
        } else if (error.code === 'auth/weak-password') {
          errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
        }
        toast({
          variant: 'destructive',
          title: 'Error de registro',
          description: errorMessage,
        });
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <Link href="/" className="flex justify-center items-center">
            <LocalLeap className="w-12 h-12 mx-auto text-primary" />
          </Link>
          <CardTitle className="text-2xl font-bold mt-4">Crear o Asignar Rol</CardTitle>
          <CardDescription>Regístrate o inicia sesión para asignar el rol de SuperAdmin.</CardDescription>
        </CardHeader>
        <form onSubmit={handleRegisterOrAssignRole}>
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
                placeholder="Mínimo 6 caracteres"
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Continuar
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              ¿Ya tienes una cuenta?{' '}
              <Link href="/login" className="underline hover:text-primary">
                Inicia Sesión
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
