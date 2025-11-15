'use client';

import { useMemo, useState } from 'react';
import { DataTable } from '@/app/dashboard/reviews/data-table';
import { columns, type Review } from '@/app/dashboard/reviews/columns';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Loader2, Printer, FileDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

type FilterType = 'all' | 'positive' | 'improve';

// In a real app, the `googleMyBusinessProfileId` would be fetched from the business's profile document.
// For simplicity, we assume here that the GMB profile ID is the same as the user's UID.
const getGMBProfileId = (userId: string) => userId;

export function PublicReviewsTable() {
    const { user, isUserLoading: isAuthLoading } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [filter, setFilter] = useState<FilterType>('all');

    const reviewsQuery = useMemo(() => {
        if (isAuthLoading || !user || !firestore) {
            return null;
        }
        const gmbProfileId = getGMBProfileId(user.uid);
        return query(
          collection(firestore, `googleMyBusinessProfiles/${gmbProfileId}/reviews`),
          orderBy('date', 'desc')
        );
    }, [firestore, user, isAuthLoading]);

    const { data: reviewsData, isLoading: isLoadingReviews, error } = useCollection<Review>(reviewsQuery);

    const filteredReviews = useMemo(() => {
        if (!reviewsData) return [];
        switch (filter) {
            case 'positive':
                return reviewsData.filter(r => r.rating >= 4);
            case 'improve':
                return reviewsData.filter(r => r.rating <= 3);
            case 'all':
            default:
                return reviewsData;
        }
    }, [reviewsData, filter]);

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPdf = () => {
        toast({
            title: 'Función en desarrollo',
            description: 'La descarga en formato PDF estará disponible próximamente.',
        })
    };

    const isLoading = isAuthLoading || isLoadingReviews;
    
    if (error) {
        console.error("Firestore Error in PublicReviewsTable:", error);
    }
    
    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                        <CardTitle>Reseñas Públicas de Google</CardTitle>
                        <CardDescription>
                            Responde a las reseñas que tus clientes han dejado en Google.
                        </CardDescription>
                    </div>
                     <div className="flex items-center gap-2">
                        <Button onClick={handlePrint} variant="outline" size="sm">
                            <Printer className="mr-2 h-4 w-4" />
                            Imprimir
                        </Button>
                        <Button onClick={handleDownloadPdf} variant="outline" size="sm">
                            <FileDown className="mr-2 h-4 w-4" />
                            Descargar PDF
                        </Button>
                        <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('all')}>Todas</Button>
                        <Button variant={filter === 'positive' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('positive')}>Positivas</Button>
                        <Button variant={filter === 'improve' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('improve')}>A Mejorar</Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                     <div className="flex items-center justify-center h-48">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-48 text-center text-destructive">
                       <p className="text-lg font-semibold">Error al cargar las reseñas</p>
                       <p className="text-sm text-muted-foreground mt-2">
                         Hubo un problema al consultar la base de datos. Revisa la consola para más detalles.
                       </p>
                    </div>
                ) : (
                    <DataTable columns={columns} data={filteredReviews || []} />
                )}
            </CardContent>
        </Card>
    );
}