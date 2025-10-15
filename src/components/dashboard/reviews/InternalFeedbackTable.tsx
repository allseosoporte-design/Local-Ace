
'use client';

import { DataTable } from '@/components/ui/data-table';
import { feedbackColumns } from '@/app/dashboard/reviews/columns';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, where } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { getIdTokenResult } from 'firebase/auth';
import type { Review } from '@/app/dashboard/reviews/columns';

export function InternalFeedbackTable() {
    const { user, isUserLoading: isAuthLoading } = useUser();
    const firestore = useFirestore();
    const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [businessIdFilter, setBusinessIdFilter] = useState<string | null>(null);

    useEffect(() => {
        const checkAdmin = async () => {
            if (user) {
                try {
                    const tokenResult = await getIdTokenResult(user, true); // Force refresh
                    const isSuper = tokenResult.claims.isSuperAdmin === true;
                    setIsSuperAdmin(isSuper);
                    if (!isSuper) {
                        setBusinessIdFilter(user.uid);
                    }
                } catch (error) {
                    console.error("Error fetching token claims:", error);
                    setIsSuperAdmin(false);
                    setBusinessIdFilter(user.uid); // Default to user's own business
                } finally {
                    setIsCheckingAdmin(false);
                }
            } else if (!isAuthLoading) {
                setIsCheckingAdmin(false);
            }
        };
        checkAdmin();
    }, [user, isAuthLoading]);

    const feedbackQuery = useMemoFirebase(() => {
        if (!firestore || isCheckingAdmin) {
            return null;
        }

        const feedbackCol = collection(firestore, `privateFeedback`);
        
        if (isSuperAdmin) {
            // Super admin sees all feedback
            return query(feedbackCol, orderBy('createdAt', 'desc'));
        }
        
        if (businessIdFilter) {
            // Regular user sees only their business's feedback
            return query(feedbackCol, where('businessId', '==', businessIdFilter), orderBy('createdAt', 'desc'));
        }

        return null;

    }, [firestore, isCheckingAdmin, isSuperAdmin, businessIdFilter]);

    const { data: feedbackData, isLoading: isLoadingFeedback } = useCollection<Review>(feedbackQuery);
    
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
