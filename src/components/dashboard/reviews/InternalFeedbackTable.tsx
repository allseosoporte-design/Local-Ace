
'use client';

import { useMemo, useEffect } from 'react';
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
        if (isAuthLoading || !user || !firestore) {
            return null;
        }

        console.log(`[DEBUG] Creando query para: businesses/${user.uid}/internalFeedback`);
        return query(
          collection(firestore, `businesses/${user.uid}/internalFeedback`),
          orderBy('createdAt', 'desc')
        );
    }, [firestore, user, isAuthLoading]);

    const { data: feedbackData, isLoading: isLoadingFeedback, error } = useCollection<Review>(feedbackQuery);
    
    useEffect(() => {
      if (error) {
        console.error("[DEBUG] Error en useCollection:", error);
      }
      if (!isLoadingFeedback && feedbackData) {
        console.log(`[DEBUG] Datos recibidos: ${feedbackData.length} documentos.`);
      }
      if(!isLoadingFeedback && !feedbackData && !error){
        console.log("[DEBUG] La consulta finalizó pero no se recibieron datos ni errores. Esto puede indicar un problema de permisos o la falta de un índice en Firestore.");
      }
    }, [feedbackData, isLoadingFeedback, error]);
    
    const isLoading = isAuthLoading || (feedbackQuery === null && !!user) || isLoadingFeedback;
    
    const sortedData = useMemo(() => {
        if (!feedbackData) return [];
        return feedbackData;
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
