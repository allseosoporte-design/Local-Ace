'use client';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Share2 } from 'lucide-react';
import { useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { PublicReviewsTable } from '@/components/dashboard/reviews/PublicReviewsTable';
import { InternalFeedbackTable } from '@/components/dashboard/reviews/InternalFeedbackTable';

export default function ReviewsPage() {
  const { user } = useUser();
  const { toast } = useToast();

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
            <PublicReviewsTable />
        </TabsContent>
        <TabsContent value="internal">
            <InternalFeedbackTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
