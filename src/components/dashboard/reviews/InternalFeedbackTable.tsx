'use client';

import { useMemo } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { feedbackColumns } from '@/app/dashboard/reviews/columns';
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, query, doc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Review } from '@/app/dashboard/reviews/columns';

interface UserProfile {
  businessId: string;
}

export function InternalFeedbackTable() {
    const { user, isUserLoading: isAuthLoading } = useUser();
    const firestore = useFirestore();

    // 1. Obtener el perfil del usuario para conseguir su businessId
    const userDocRef = useMemoFirebase(() => {
        // CORRECCIÓN: No ejecutar la consulta hasta que la autenticación haya terminado.
        if (isAuthLoading || !user?.uid) return null;
        return doc(firestore, `users/${user.uid}`);
    }, [firestore, user, isAuthLoading]);

    const { data: userProfile, isLoading: isLoadingProfile } = useDoc<UserProfile>(userDocRef);

    // 2. Consultar el feedback usando el businessId del perfil
    const feedbackQuery = useMemoFirebase(() => {
        // La consulta ahora depende de que tengamos el perfil del usuario,
        // y el perfil del usuario depende de que la autenticación haya terminado.
        if (!userProfile?.businessId) {
            return null;
        }

        console.log('🔍 DASHBOARD - User UID:', user?.uid);
        console.log('🔍 DASHBOARD - BusinessId from Profile:', userProfile.businessId);
        console.log('🔍 DASHBOARD - Buscando en:', `businesses/${userProfile.businessId}/privateFeedback`);

        // Usamos el businessId obtenido del perfil del usuario.
        return query(
          collection(firestore, `businesses/${userProfile.businessId}/privateFeedback`)
        );

    }, [firestore, userProfile, user]);

    const { data: feedbackData, isLoading: isLoadingFeedback } = useCollection<Review>(feedbackQuery);
    
    // isLoading es verdadero si la autenticación, la carga del perfil o la carga del feedback están en progreso.
    const isLoading = isAuthLoading || isLoadingProfile || (feedbackQuery !== null && isLoadingFeedback);

    // Ordenar en el cliente mientras se crea el índice
    const sortedData = useMemo(() => {
        if (!feedbackData) return [];
        return [...feedbackData].sort((a, b) => {
            const dateA = a.createdAt?.toDate?.().getTime() || 0;
            const dateB = b.createdAt?.toDate?.().getTime() || 0;
            return dateB - dateA;
        });
    }, [feedbackData]);

    // Lógica para manejar el caso en que el perfil no existe
    if (!isAuthLoading && !isLoadingProfile && !userProfile) {
      return (
        <Card>
            <CardHeader>
                <CardTitle>Feedback Interno</CardTitle>
                <CardDescription>
                    Comentarios de clientes que te calificaron con 1-4 estrellas. Esto no es público.
                </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <p className="text-lg font-semibold">Perfil de usuario no encontrado.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Asegúrate de que exista un documento en la colección `users` con tu UID y que contenga el campo `businessId`.
                </p>
              </div>
            </CardContent>
        </Card>
      )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Feedback Interno</CardTitle>
                <CardDescription>
                    Comentarios de clientes que te calificaron con 1-4 estrellas. Esto no es público.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                     <div className="flex items-center justify-center h-48">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : (
                    <DataTable columns={feedbackColumns} data={sortedData} />
                )}
            </CardContent>
        </Card>
    );
}
