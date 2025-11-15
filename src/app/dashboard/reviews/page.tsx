'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Share2, Loader2 } from 'lucide-react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { DataTable } from '@/app/dashboard/reviews/data-table';
import { getColumns, type Review } from '@/app/dashboard/reviews/columns';

export default function ReviewsPage() {
  const { user, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const columns = useMemo(() => getColumns(), []);

  const handleCopyLink = () => {
    const businessId = user?.uid;
    if (!businessId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo obtener el ID del negocio. Inténtalo de nuevo.',
      });
      return;
    }
    const funnelUrl = `${window.location.origin}/funnel/${businessId}`;
    navigator.clipboard.writeText(funnelUrl);
    toast({
      title: '¡Enlace copiado!',
      description: 'El enlace del embudo de reseñas ha sido copiado al portapapeles.',
    });
  };

  // Query for public reviews
  const publicReviewsQuery = useMemo(() => {
    if (isAuthLoading || !user || !firestore) return null;
    const gmbProfileId = user.uid; // Assumption for simplicity
    return query(
      collection(firestore, `googleMyBusinessProfiles/${gmbProfileId}/reviews`),
      orderBy('date', 'desc')
    );
  }, [firestore, user, isAuthLoading]);

  // Query for internal feedback
  const internalFeedbackQuery = useMemo(() => {
    if (isAuthLoading || !user || !firestore) return null;
    return query(
      collection(firestore, `internalFeedback`),
      where('businessId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
  }, [firestore, user, isAuthLoading]);

  const { data: publicReviews, isLoading: isLoadingPublic, error: publicError } = useCollection<Review>(publicReviewsQuery);
  const { data: internalFeedback, isLoading: isLoadingInternal, error: internalError } = useCollection<Review>(internalFeedbackQuery);
  
  const isLoading = isAuthLoading || isLoadingPublic || isLoadingInternal;
  const error = publicError || internalError;
  
   if (error) {
        console.error("Firestore Error in ReviewsPage:", error);
    }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Panel de Reseñas Inteligentes
          </h1>
          <p className="text-muted-foreground">
            Gestiona tu reputación online e interactúa con los clientes.
          </p>
        </div>
        <Button onClick={handleCopyLink} disabled={!user}>
          <Share2 className="mr-2 h-4 w-4" />
          Copiar Enlace del Embudo
        </Button>
      </div>

      <Tabs defaultValue="public">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="public">Reseñas Públicas</TabsTrigger>
          <TabsTrigger value="internal">Feedback Interno</TabsTrigger>
        </TabsList>
        <TabsContent value="public">
          <Card>
            <CardHeader>
              <CardTitle>Reseñas Públicas de Google</CardTitle>
              <CardDescription>
                Responde a las reseñas que tus clientes han dejado en Google.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <DataTable columns={columns} data={publicReviews || []} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="internal">
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
                <DataTable columns={columns} data={internalFeedback || []} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}