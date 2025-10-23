
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
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { LocalLeap } from '@/components/icons';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
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
        toast({
            variant: 'destructive',
            title: 'Acción no permitida',
            description: 'Este correo es para un rol especial. Inicia sesión si ya tienes credenciales.',
        });
        setIsLoading(false);
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const batch = writeBatch(firestore);

        // Create the user profile mapping document
        const userProfileRef = doc(firestore, 'users', user.uid);
        batch.set(userProfileRef, {
            businessId: user.uid,
            email: user.email,
        });

        // Create the business document
        const businessRef = doc(firestore, 'businesses', user.uid);
        batch.set(businessRef, {
            name: user.email, // Default name
            adminEmail: user.email,
            status: "Active",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        
        // Create default landing page config for the new business
        const landingConfigRef = doc(firestore, `businesses/${user.uid}/landingPages`, 'config');
        batch.set(landingConfigRef, {
          title: `Bienvenido a ${user.email}`,
          subtitle: "Esta es tu nueva landing page. ¡Edítala desde tu panel!",
          content: ``,
          heroImageUrl: "https://picsum.photos/seed/default-hero/1200/600",
          ctaText: "Deja tu Reseña",
          ctaUrl: `/funnel/${user.uid}`,
          backgroundColor: "#FFFFFF",
          textColor: "#000000",
          buttonColor: "#FF4500",
          sections: [],
          testimonialsTitle: "Lo que opinan nuestros clientes",
          testimonialsSubtitle: "La satisfacción de nuestros usuarios impulsa lo que hacemos",
          testimonials: [],
          seo: {
            title: `Landing Page de ${user.email}`,
            description: "Una nueva landing page creada con Local Leap.",
            keywords: ["negocio local", "servicios"],
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        // Create default form config for the new business
        const formConfigRef = doc(firestore, `businesses/${user.uid}/landingPages`, 'form');
        batch.set(formConfigRef, {
          redirectUrl: `https://www.google.com/maps/search/?api=1&query=${user.uid}`,
          notificationEmail: user.email,
          formTitle: "¿Cómo fue tu experiencia?",
          formSubtitle: "Tus comentarios nos ayudan a mejorar.",
          negativeFeedbackTitle: "Déjanos tus comentarios",
          negativeFeedbackSubtitle: "Lamentamos que tu experiencia no haya sido perfecta. Por favor, dinos cómo podemos mejorar.",
          positiveFeedbackTitle: "¡Gracias por tu reseña!",
          positiveFeedbackSubtitle: "Nos alegra que hayas tenido una gran experiencia. Ayuda a otros a descubrirnos compartiendo tu opinión en Google.",
          thankYouTitle: "¡Gracias!",
          thankYouSubtitle: "Tus comentarios son muy valiosos para nosotros.",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        // Create initial contact form config
        const contactFormConfigRef = doc(firestore, `businesses/${user.uid}/contactForms`, 'config');
        batch.set(contactFormConfigRef, {
            fields: [
              { id: 'nombre', type: 'text', label: 'Nombre', placeholder: 'Tu nombre completo', required: true },
              { id: 'correo', type: 'email', label: 'Correo Electrónico', placeholder: 'tu@ejemplo.com', required: true },
              { id: 'mensaje', type: 'textarea', label: 'Mensaje', placeholder: 'Escribe tu mensaje aquí...', required: true },
            ],
            emailConfig: {
                recipientEmail: user.email,
                subject: 'Nuevo mensaje desde tu formulario de contacto',
            },
            updatedAt: serverTimestamp(),
        });

        if (!user.displayName) {
           await updateProfile(user, { displayName: user.email });
        }
        
        await batch.commit();

        toast({
          title: '¡Registro exitoso!',
          description: 'Tu cuenta ha sido creada. Ahora puedes iniciar sesión.',
        });
        router.push('/login');
      } catch (error: any)
      {
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

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <Link href="/" className="flex justify-center items-center">
            <LocalLeap className="w-12 h-12 mx-auto text-primary" />
          </Link>
          <CardTitle className="text-2xl font-bold mt-4">Crear una Cuenta</CardTitle>
          <CardDescription>Empieza a gestionar tu negocio online.</CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
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
              Registrarse
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
