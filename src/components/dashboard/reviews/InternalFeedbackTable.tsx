'use client';

import { useMemo } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { feedbackColumns } from '@/app/dashboard/reviews/columns';
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Review } from '@/app/dashboard/reviews/columns';

interface UserProfile {
  businessId: string;
}

export function InternalFeedbackTable() {
    const { user, isUserLoading: isAuthLoading } = useUser();
    const firestore = useFirestore();

    // Paso 1: Crear una referencia al documento del perfil del usuario.
    // Esta consulta solo se ejecutará cuando la autenticación haya terminado y tengamos un user.uid.
    const userDocRef = useMemoFirebase(() => {
        if (isAuthLoading || !user?.uid) {
            return null;
        }
        return doc(firestore, `users/${user.uid}`);
    }, [firestore, user, isAuthLoading]);

    // Paso 2: Usar el hook useDoc para obtener los datos del perfil del usuario.
    const { data: userProfile, isLoading: isLoadingProfile } = useDoc<UserProfile>(userDocRef);

    // Paso 3: Usar el businessId obtenido del perfil para construir la consulta final.
    // Esta consulta solo se ejecutará cuando tengamos un userProfile con un businessId.
    const feedbackQuery = useMemoFirebase(() => {
        if (!userProfile?.businessId) {
            return null;
        }
        return query(
          collection(firestore, `businesses/${userProfile.businessId}/privateFeedback`),
          orderBy('createdAt', 'desc')
        );
    }, [firestore, userProfile]);

    const { data: feedbackData, isLoading: isLoadingFeedback } = useCollection<Review>(feedbackQuery);
    
    // El estado de carga general considera la autenticación, la carga del perfil y la carga del feedback.
    const isLoading = isAuthLoading || isLoadingProfile || (feedbackQuery !== null && isLoadingFeedback);
    
    const sortedData = useMemo(() => {
        if (!feedbackData) return [];
        return feedbackData; // La ordenación ya se hace en la consulta de Firestore
    }, [feedbackData]);

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
                  No pudimos encontrar el perfil de negocio asociado a tu cuenta.
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
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <DataTable columns={feedbackColumns} data={sortedData} />
                )}
            </CardContent>
        </Card>
    );
}
