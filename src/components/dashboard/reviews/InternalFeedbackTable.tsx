
'use client';

import { DataTable } from "@/components/ui/data-table";
import { feedbackColumns } from "@/app/dashboard/reviews/columns";
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from "react";
import { getIdTokenResult } from "firebase/auth";

export function InternalFeedbackTable() {
    const { user, isUserLoading: isAuthLoading } = useUser();
    const firestore = useFirestore();
    const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);

    useEffect(() => {
        const checkAdmin = async () => {
            if (user) {
                try {
                    const tokenResult = await getIdTokenResult(user, true); // Force refresh
                    setIsSuperAdmin(tokenResult.claims.isSuperAdmin === true);
                } catch (error) {
                    console.error("Error fetching token claims:", error);
                    setIsSuperAdmin(false);
                } finally {
                    setIsCheckingAdmin(false);
                }
            } else if (!isAuthLoading) {
                // If there's no user and auth is not loading, we can stop checking
                setIsCheckingAdmin(false);
            }
        };
        checkAdmin();
    }, [user, isAuthLoading]);

    const feedbackQuery = useMemoFirebase(() => {
        // Query should only run if:
        // 1. Firestore is available
        // 2. We have finished checking for admin status
        // 3. The user is a super admin
        if (!firestore || isCheckingAdmin || !isSuperAdmin) {
            return null;
        }

        // For super admin, we could query a root `privateFeedback` collection.
        // Assuming the model is `businesses/{businessId}/privateFeedback`
        // Super admin might need a different query, but for now we'll stick to one business for simplicity.
        if (user) {
           return query(collection(firestore, `businesses/${user.uid}/privateFeedback`), orderBy('createdAt', 'desc'));
        }
        return null;

    }, [firestore, isCheckingAdmin, isSuperAdmin, user]);

    const { data: feedbackData, isLoading: isLoadingFeedback } = useCollection(feedbackQuery);
    
    // The component is loading if auth is loading OR admin check is happening OR the query is running.
    const isLoading = isAuthLoading || isCheckingAdmin || (feedbackQuery !== null && isLoadingFeedback);

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
                    <DataTable columns={feedbackColumns} data={feedbackData || []} />
                )}
            </CardContent>
        </Card>
    );
}
