'use client';

import { useMemo, useEffect } from 'react';
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

    // 1. Wait for auth to finish, then create ref to user profile
    const userDocRef = useMemoFirebase(() => {
        if (isAuthLoading || !user?.uid) return null;
        return doc(firestore, `users/${user.uid}`);
    }, [firestore, user, isAuthLoading]);

    const { data: userProfile, isLoading: isLoadingProfile } = useDoc<UserProfile>(userDocRef);

    // 2. Wait for user profile to load, then create query for feedback
    const feedbackQuery = useMemoFirebase(() => {
        if (isLoadingProfile || !userProfile?.businessId) {
            return null;
        }
        return query(
          collection(firestore, `businesses/${userProfile.businessId}/privateFeedback`)
        );
    }, [firestore, userProfile, isLoadingProfile]);

    const { data: feedbackData, isLoading: isLoadingFeedback } = useCollection<Review>(feedbackQuery);
    
    // Overall loading is true if any of the sequential steps are loading
    const isLoading = isAuthLoading || isLoadingProfile || (feedbackQuery !== null && isLoadingFeedback);

    const sortedData = useMemo(() => {
        if (!feedbackData) return [];
        return [...feedbackData].sort((a, b) => {
            const dateA = a.createdAt?.toDate?.().getTime() || 0;
            const dateB = b.createdAt?.toDate?.().getTime() || 0;
            return dateB - dateA;
        });
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
                  No se pudo cargar tu perfil. Contacta a soporte si el problema persiste.
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

    