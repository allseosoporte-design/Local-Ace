
'use client';

import { useMemo } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { feedbackColumns } from '@/app/dashboard/reviews/columns';
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, where } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Review } from '@/app/dashboard/reviews/columns';

interface UserProfile {
  businessId: string;
}

export function InternalFeedbackTable() {
    const { user, isUserLoading: isAuthLoading } = useUser();
    const firestore = useFirestore();

    const userDocRef = useMemoFirebase(() => {
        if (isAuthLoading || !user?.uid) {
            return null;
        }
        return doc(firestore, `users/${user.uid}`);
    }, [firestore, user, isAuthLoading]);

    const { data: userProfile, isLoading: isLoadingProfile } = useDoc<UserProfile>(userDocRef);

    const feedbackQuery = useMemoFirebase(() => {
        if (!userProfile?.businessId) {
            return null;
        }
        
        console.log('🔍 DASHBOARD - Buscando feedback para businessId:', userProfile.businessId);

        return query(
          collection(firestore, 'internalFeedback'),
          where('businessId', '==', userProfile.businessId),
          orderBy('createdAt', 'desc')
        );
    }, [firestore, userProfile]);

    const { data: feedbackData, isLoading: isLoadingFeedback } = useCollection<Review>(feedbackQuery);
    
    const isLoading = isAuthLoading || isLoadingProfile || (feedbackQuery !== null && isLoadingFeedback);
    
    const sortedData = useMemo(() => {
        if (!feedbackData) return [];
        // Renombrar 'message' a 'review' para que coincida con la definición de columna
        return feedbackData.map(item => ({...item, review: (item as any).message || ''}));
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
