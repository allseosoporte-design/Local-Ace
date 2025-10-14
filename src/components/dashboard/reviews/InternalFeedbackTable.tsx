'use client';

import { DataTable } from "@/components/ui/data-table";
import { feedbackColumns } from "@/app/dashboard/reviews/columns";
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function InternalFeedbackTable() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const feedbackQuery = useMemoFirebase(() => {
        // Wait until user is fully loaded and available before creating the query
        if (isUserLoading || !user || !firestore) {
            return null;
        }
        return query(collection(firestore, `businesses/${user.uid}/privateFeedback`), orderBy('createdAt', 'desc'));
    }, [user, firestore, isUserLoading]);

    const { data: feedbackData, isLoading: isLoadingFeedback } = useCollection(feedbackQuery);
    
    // The component is loading if auth is loading OR if the query is running.
    const isLoading = isUserLoading || (feedbackQuery !== null && isLoadingFeedback);
    const showLoadingSpinner = isLoading && feedbackQuery !== null;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Feedback Interno</CardTitle>
                <CardDescription>
                    Comentarios de clientes que te calificaron con 1-4 estrellas. Esto no es público.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {showLoadingSpinner ? (
                     <div className="flex items-center justify-center h-48">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : (
                    <DataTable columns={feedbackColumns} data={feedbackData || []} />
                )}
            </CardContent>
        </Card>
    );
}
