
'use client';

import { useMemo } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { feedbackColumns } from '@/app/dashboard/reviews/columns';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, where } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Review } from '@/app/dashboard/reviews/columns';

export function InternalFeedbackTable() {
    const { user, isUserLoading: isAuthLoading } = useUser();
    const firestore = useFirestore();

    const feedbackQuery = useMemoFirebase(() => {
        // No ejecutar la consulta hasta que el usuario esté completamente cargado y tengamos su UID.
        if (isAuthLoading || !user || !firestore) {
            return null;
        }

        console.log('🔍 DASHBOARD - Buscando feedback para businessId (uid):', user.uid);

        // Consultar directamente la colección raíz 'internalFeedback' y filtrar por el UID del usuario.
        // Se asume que para un administrador de negocio, su `user.uid` es su `businessId`.
        return query(
          collection(firestore, 'internalFeedback'),
          where('businessId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
    }, [firestore, user, isAuthLoading]);

    const { data: feedbackData, isLoading: isLoadingFeedback } = useCollection<Review>(feedbackQuery);
    
    // isLoading es verdadero si la autenticación está en curso o si la consulta de feedback está en curso.
    // También se considera cargando si la consulta es nula porque todavía estamos esperando al usuario.
    const isLoading = isAuthLoading || (feedbackQuery === null && !!user) || isLoadingFeedback;
    
    const sortedData = useMemo(() => {
        if (!feedbackData) return [];
        // Renombrar 'message' a 'review' para que coincida con la definición de la columna.
        return feedbackData.map(item => ({...item, review: (item as any).message || ''}));
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
                  Por favor, inicia sesión para ver tu feedback.
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
