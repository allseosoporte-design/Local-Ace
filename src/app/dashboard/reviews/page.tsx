
'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Share2, Loader2, Star, MessageSquare } from 'lucide-react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { DataTable } from '@/components/ui/data-table';
import { columns, Review } from './columns';
import { useMemo, useState } from 'react';
import { collection, query, where, orderBy } from 'firebase/firestore';

export default function ReviewsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [filter, setFilter] = useState<'all' | 'negative' | 'positive'>('all');

  const reviewsQuery = useMemo(() => {
    if (!user || !firestore) return null;

    const constraints = [where('businessId', '==', user.uid), orderBy('createdAt', 'desc')];
    if (filter === 'negative') {
        constraints.push(where('rating', '<', 4));
    } else if (filter === 'positive') {
        constraints.push(where('rating', '>=', 4));
    }

    return query(collection(firestore, 'internalFeedback'), ...constraints);

  }, [firestore, user, filter]);

  const { data: reviews, isLoading, error } = useCollection<Review>(reviewsQuery);

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

  const reviewSummary = useMemo(() => {
    if (!reviews) return { total: 0, positive: 0, negative: 0 };
    return {
        total: reviews.length,
        positive: reviews.filter(r => r.rating >= 4).length,
        negative: reviews.filter(r => r.rating < 4).length,
    }
  }, [reviews]);


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

       <div className="grid gap-4 md:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Reseñas</CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{isLoading ? <Loader2 className='h-6 w-6 animate-spin'/> : reviewSummary.total}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Reseñas Positivas (4-5 ⭐)</CardTitle>
                    <Star className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{isLoading ? <Loader2 className='h-6 w-6 animate-spin'/> : reviewSummary.positive}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Reseñas a Mejorar (1-3 ⭐)</CardTitle>
                    <Star className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                     <div className="text-2xl font-bold">{isLoading ? <Loader2 className='h-6 w-6 animate-spin'/> : reviewSummary.negative}</div>
                </CardContent>
            </Card>
       </div>

      <Card>
        <CardHeader>
            <div className='flex items-center justify-between'>
                <div>
                    <CardTitle>Bandeja de Entrada de Reseñas</CardTitle>
                    <CardDescription>
                        Visualiza, filtra y responde a las reseñas de tus clientes.
                    </CardDescription>
                </div>
                <div className='flex items-center gap-2'>
                    <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>Todas</Button>
                    <Button variant={filter === 'positive' ? 'default' : 'outline'} onClick={() => setFilter('positive')}>Positivas</Button>
                    <Button variant={filter === 'negative' ? 'default' : 'outline'} onClick={() => setFilter('negative')}>A Mejorar</Button>
                </div>
            </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-48 w-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
             <DataTable columns={columns} data={reviews || []} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
