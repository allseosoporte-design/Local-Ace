'use client';

import { useMemo } from 'react';
import { DataTable } from '@/app/dashboard/reviews/data-table';
import { columns, type Review } from '@/app/dashboard/reviews/columns';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function InternalFeedbackTable() {
    const { user, isUserLoading: isAuthLoading } = useUser();
    const firestore = useFirestore();

    const feedbackQuery = useMemo(() => {
        if (isAuthLoading || !user || !firestore) {
            return null;
        }
        return query(
          collection(firestore, `internalFeedback`),
          where('businessId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
    }, [firestore, user, isAuthLoading]);

    const { data: feedbackData, isLoading: isLoadingFeedback, error } = useCollection<Review>(feedbackQuery);

    const isLoading = isAuthLoading || isLoadingFeedback;
    
    if (error) {
        console.error("Firestore Error in InternalFeedbackTable:", error);
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
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-48 text-center text-destructive">
                       <p className="text-lg font-semibold">Error al cargar el feedback</p>
                       <p className="text-sm text-muted-foreground mt-2">
                         Hubo un problema al consultar la base de datos. Revisa la consola para más detalles.
                       </p>
                    </div>
                ) : (
                    <DataTable columns={columns} data={feedbackData || []} />
                )}
            </CardContent>
        </Card>
    );
}
