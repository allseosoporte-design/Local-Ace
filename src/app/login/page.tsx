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
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { LocalLeap } from '@/components/icons';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

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
      // 1. Iniciar sesión
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Verificar si es superAdmin ANTES de redirigir
      try {
        const adminDocRef = doc(firestore, 'superAdmins', user.uid);
        const adminDoc = await getDoc(adminDocRef);
        
        if (adminDoc.exists()) {
          // Es superAdmin → redirigir a panel admin
          router.push('/dashboard/admin');
        } else {
          // Usuario normal → redirigir a dashboard estándar
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error verificando rol, redirigiendo a dashboard estándar:', error);
        router.push('/dashboard');
      }

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error de inicio de sesión',
        description: 'Credenciales incorrectas. Por favor, inténtalo de nuevo.',
      });
      setIsLoading(false); // Asegúrate de detener la carga en caso de error de login
    }
    // finally se ejecutará incluso después de la redirección, por lo que podemos quitarlo
    // para evitar un posible flash del estado de carga. La carga se detiene en caso de error.
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
