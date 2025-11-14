'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/app/dashboard/reviews/data-table';
import { columns, type Review } from '@/app/dashboard/reviews/columns';
import { Button } from '@/components/ui/button';
import { Printer, FileDown } from 'lucide-react';

// This is a placeholder component.
// In a real application, you would fetch public reviews from Google My Business API
// or a dedicated 'publicReviews' collection in Firestore.

const mockPublicReviews: Review[] = [
    // Example data. Replace with real data fetching.
];

export function PublicReviewsTable() {
    const handlePrint = () => {
        window.print();
    };

    // Placeholder function for PDF download
    const handleDownloadPdf = () => {
        alert('La funcionalidad para descargar PDF se implementará en el futuro.');
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                    <div>
                        <CardTitle>Reseñas Públicas de Google</CardTitle>
                        <CardDescription>
                            Responde a las reseñas que tus clientes han dejado en Google.
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button onClick={handlePrint}>
                            <Printer className="mr-2 h-4 w-4" />
                            Imprimir
                        </Button>
                        <Button onClick={handleDownloadPdf} variant="outline">
                            <FileDown className="mr-2 h-4 w-4" />
                            Descargar PDF
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <DataTable columns={columns} data={mockPublicReviews} />
            </CardContent>
        </Card>
    );
}
