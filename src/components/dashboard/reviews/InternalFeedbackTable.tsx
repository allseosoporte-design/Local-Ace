'use client';

import { useMemo } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { feedbackColumns } from '@/app/dashboard/reviews/columns';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Review } from '@/app/dashboard/reviews/columns';

export function InternalFeedbackTable() {
    const { user, isUserLoading: isAuthLoading } = useUser();
    const firestore = useFirestore();

    const feedbackQuery = useMemoFirebase(() => {
        // DO NOT RUN the query until the user object is loaded and we have a UID.
        if (isAuthLoading || !user?.uid) {
            return null;
        }

        // Temporarily without orderBy to test
        return query(
          collection(firestore, `businesses/${user.uid}/privateFeedback`)
        );

    }, [firestore, user, isAuthLoading]);

    const { data: feedbackData, isLoading: isLoadingFeedback } = useCollection<Review>(feedbackQuery);
    
    const isLoading = isAuthLoading || (feedbackQuery !== null && isLoadingFeedback);

    // Sort data on the client-side while the index is being created
    const sortedData = useMemo(() => {
        if (!feedbackData) return [];
        return [...feedbackData].sort((a, b) => {
            const dateA = a.createdAt?.toDate?.().getTime() || 0;
            const dateB = b.createdAt?.toDate?.().getTime() || 0;
            return dateB - dateA;
        });
    }, [feedbackData]);

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
