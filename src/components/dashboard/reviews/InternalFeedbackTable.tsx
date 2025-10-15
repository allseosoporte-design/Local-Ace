'use client';

import { useMemo } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { feedbackColumns } from '@/app/dashboard/reviews/columns';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Review } from '@/app/dashboard/reviews/columns';

export function InternalFeedbackTable() {
    const { user, isUserLoading: isAuthLoading } = useUser();
    const firestore = useFirestore();

    const feedbackQuery = useMemoFirebase(() => {
        // Espera a que la autenticación termine y tengamos un ID de usuario.
        if (isAuthLoading || !user?.uid) {
            return null;
        }

        // Construye la consulta directamente con el UID del usuario como ID del negocio.
        return query(
          collection(firestore, `businesses/${user.uid}/privateFeedback`),
          orderBy('createdAt', 'desc')
        );

    }, [firestore, user, isAuthLoading]);

    const { data: feedbackData, isLoading: isLoadingFeedback } = useCollection<Review>(feedbackQuery);
    
    // La carga general depende de la autenticación o de la carga de datos de Firestore.
    const isLoading = isAuthLoading || (feedbackQuery !== null && isLoadingFeedback);

    const sortedData = useMemo(() => {
        if (!feedbackData) return [];
        // La ordenación ya se hace en la consulta de Firestore, pero mantenemos esto
        // como una capa extra de seguridad por si Firestore devuelve datos desordenados.
        return [...feedbackData].sort((a, b) => {
            const dateA = a.createdAt?.toDate?.().getTime() || 0;
            const dateB = b.createdAt?.toDate?.().getTime() || 0;
            return dateB - dateA;
        });
    }, [feedbackData]);

    if (!isAuthLoading && !user) {
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
                <p className="text-lg font-semibold">No has iniciado sesión.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Por favor, inicia sesión para ver tus comentarios internos.
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
