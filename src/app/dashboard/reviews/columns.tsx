
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Sparkles, Star, Trash2, Eye, Copy, Link as LinkIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { generateReviewResponse } from "@/ai/flows/generate-review-response";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Timestamp, doc, deleteDoc } from "firebase/firestore";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";
import { useFirestore, useUser } from "@/firebase";
import { cn } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";

export type Review = {
  id: string;
  businessId?: string; // Feedback interno lo tiene
  googleMyBusinessProfileId?: string; // Reseña pública lo tiene
  name: string; // Para feedback interno
  authorName?: string; // Para reseña pública
  email?: string;
  rating: number;
  review?: string; // Feedback interno
  comment?: string; // Reseña pública
  createdAt?: Timestamp; // Feedback interno
  date?: Timestamp; // Reseña pública
  status?: "Pending" | "Responded";
};


const ActionsCell: ColumnDef<Review>['cell'] = ({ row }) => {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();

  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [draftResponse, setDraftResponse] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const review = row.original;
  
  const reviewText = review.review || review.comment || '';
  const customerName = review.name || review.authorName || 'Cliente';
  const reviewDate = review.createdAt || review.date;

  const handleGenerateResponse = async () => {
    if (!user) return;
    setIsGenerating(true);
    try {
      const result = await generateReviewResponse({
        reviewText: reviewText,
        businessName: user.displayName || "nuestro negocio",
        customerName: customerName,
        industry: "Servicio al cliente",
        customerSentiment: review.rating >= 4 ? "positive" : (review.rating === 3 ? "neutral" : "negative"),
      });
      setDraftResponse(result.draftResponse);
      setIsAiDialogOpen(true);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error de IA",
        description: "No se pudo generar la respuesta. Por favor, inténtalo de nuevo.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyFollowUpLink = () => {
    if (!user) return;
    const funnelUrl = `${window.location.origin}/funnel/${user.uid}`;
    navigator.clipboard.writeText(funnelUrl);
    toast({
      title: "¡Enlace Copiado!",
      description: "Envía este enlace al cliente para que actualice su calificación.",
    });
  };

  const handleSendResponse = () => {
    toast({
      title: "¡Respuesta Enviada!",
      description: "Tu respuesta ha sido enviada al cliente (simulación).",
    });
    setIsAiDialogOpen(false);
  };
  
  const handleDelete = async () => {
    if (!firestore || !user) return;
    
    const isInternalFeedback = !!review.businessId;
    
    let docRef;
    if (isInternalFeedback) {
      docRef = doc(firestore, "internalFeedback", review.id);
    } else if (review.googleMyBusinessProfileId) {
      docRef = doc(firestore, `googleMyBusinessProfiles/${user.uid}/reviews`, review.id);
    } else {
        toast({ variant: 'destructive', title: 'Error', description: 'No se puede identificar el tipo de reseña.' });
        return;
    }

    try {
      await deleteDoc(docRef);
      toast({
        title: "Elemento eliminado",
        description: "La reseña/feedback ha sido eliminada permanentemente."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al eliminar",
        description: "No se pudo eliminar el elemento de la base de datos."
      });
    }
    setIsDeleteDialogOpen(false);
  };

  const formattedDate = reviewDate 
    ? format(reviewDate.toDate(), 'dd/MM/yyyy HH:mm') 
    : 'N/A';

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menú</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setIsDetailsOpen(true)}>
            <Eye className="mr-2 h-4 w-4" /> Ver Detalles
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleGenerateResponse} disabled={isGenerating}>
            <Sparkles className="mr-2 h-4 w-4" />
            {isGenerating ? "Generando..." : "Generar Respuesta con IA"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleCopyFollowUpLink}>
            <LinkIcon className="mr-2 h-4 w-4" /> Copiar Link de Seguimiento
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

       <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalles de la Reseña</DialogTitle>
            <DialogDescription>
              Reseña completa de {customerName}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Cliente:</Label>
              <span className="col-span-3 font-medium">{customerName}</span>
            </div>
            {review.email && (
             <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Email:</Label>
              <a href={`mailto:${review.email}`} className="col-span-3 text-primary underline">{review.email}</a>
            </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Fecha:</Label>
              <span className="col-span-3 text-muted-foreground">{formattedDate}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Calificación:</Label>
              <div className="col-span-3 flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn("w-5 h-5",
                      i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                    )}
                  />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-1">Comentario:</Label>
              <p className="col-span-3 bg-muted p-3 rounded-md text-sm leading-relaxed whitespace-pre-wrap">
                {reviewText}
              </p>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="secondary">Cerrar</Button></DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isAiDialogOpen} onOpenChange={setIsAiDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Borrador de respuesta para {customerName}</DialogTitle>
            <DialogDescription>
              Revisa y edita la respuesta generada por la IA antes de enviarla.
            </DialogDescription>
          </DialogHeader>
          <Textarea 
            value={draftResponse}
            onChange={(e) => setDraftResponse(e.target.value)}
            className="min-h-[150px] bg-background mt-4"
          />
          <DialogFooter className="mt-4">
            <Button variant="ghost" onClick={() => setIsAiDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSendResponse}>Enviar Respuesta</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                    Esta acción es irreversible. El comentario de <span className="font-bold">{customerName}</span> será eliminado permanentemente.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                    Eliminar
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export const getColumns = (): ColumnDef<Review>[] => [
  {
    accessorKey: "name",
    header: "Cliente",
    cell: ({ row }) => (
        <span>{row.original.name || row.original.authorName}</span>
    )
  },
  {
    accessorKey: "review",
    header: "Reseña",
    cell: ({ row }: { row: { original: Review } }) => (
      <p className="text-muted-foreground max-w-xs truncate">
        {row.original.review || row.original.comment}
      </p>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Fecha",
     cell: ({ row }) => {
      const date = row.original.createdAt || row.original.date;
      if (date && date.toDate) {
        return format(date.toDate(), 'dd/MM/yyyy HH:mm');
      }
      return 'N/A';
    },
  },
  {
    accessorKey: "rating",
    header: "Calificación",
    cell: ({ row }) => {
      const rating = row.original.rating;
      let badgeClass = '';
      if (rating >= 4) {
        badgeClass = 'bg-green-100 text-green-800 border-green-200';
      } else if (rating === 3) {
        badgeClass = 'bg-yellow-100 text-yellow-800 border-yellow-200';
      } else {
        badgeClass = 'bg-red-100 text-red-800 border-red-200';
      }
      return (
        <div className="flex items-center">
          <Badge variant="outline" className={cn("flex gap-1 items-center pr-1 pl-2", badgeClass)}>
            {rating} <Star className="w-3 h-3 fill-current" />
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.original.status || "Pending";
      const statusMap = { Pending: "Pendiente", Responded: "Respondido" }
      return <Badge variant={status === "Pending" ? "outline" : "default"}>{statusMap[status]}</Badge>;
    },
  },
  {
    id: "actions",
    cell: ActionsCell
  },
];
