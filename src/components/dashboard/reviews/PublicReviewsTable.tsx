'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/app/dashboard/reviews/data-table';
import { columns, type Review } from '@/app/dashboard/reviews/columns';

// This is a placeholder component.
// In a real application, you would fetch public reviews from Google My Business API
// or a dedicated 'publicReviews' collection in Firestore.

const mockPublicReviews: Review[] = [
    // Example data. Replace with real data fetching.
];

export function PublicReviewsTable() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Reseñas Públicas de Google</CardTitle>
                <CardDescription>
                    Responde a las reseñas que tus clientes han dejado en Google.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <DataTable columns={columns} data={mockPublicReviews} />
            </CardContent>
        </Card>
    );
}
