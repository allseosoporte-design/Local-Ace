"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Sparkles, Star, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
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
import { useFirestore } from "@/firebase";


// This type is manually created for demonstration.
// In a real app, you would generate this from your database schema.
export type Review = {
  id: string;
  name: string;
  email: string;
  rating: number;
  review: string;
  date?: string; // Kept for public reviews
  createdAt?: Timestamp; // For internal feedback
  status?: "Pending" | "Responded";
};

const ActionsCell = function Actions({ row }: { row: { original: Review } }) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [draftResponse, setDraftResponse] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const review = row.original;

  const handleGenerateResponse = async () => {
    setIsGenerating(true);
    try {
      const result = await generateReviewResponse({
        reviewText: review.review,
        businessName: "The Cozy Corner Cafe",
        industry: "Cafetería",
        customerSentiment: review.rating >= 4 ? "positive" : "negative",
      });
      setDraftResponse(result.draftResponse);
      setIsAiDialogOpen(true);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo generar la respuesta de la IA.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendResponse = () => {
    console.log("Enviando respuesta:", draftResponse);
    toast({
      title: "¡Respuesta Enviada!",
      description: "Tu respuesta ha sido enviada al cliente.",
    });
    setIsAiDialogOpen(false);
  };
  
  const handleDelete = async () => {
    // This function will handle deletion from Firestore.
    // For the static public reviews, it will just show a toast.
    if (review.createdAt && firestore) { // Indicates it's an internal feedback from Firestore
        try {
            const docRef = doc(firestore, "internalFeedback", review.id);
            await deleteDoc(docRef);
            toast({
                title: "Feedback eliminado",
                description: "El comentario ha sido eliminado permanentemente."
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error al eliminar",
                description: "No se pudo eliminar el comentario de la base de datos."
            });
        }
    } else {
        // For static data, we just simulate the deletion
        toast({
            title: "Reseña eliminada (simulación)",
            description: `La reseña de ${review.name} ha sido eliminada.`
        });
    }
    setIsDeleteDialogOpen(false);
  };

  const formattedDate = review.createdAt 
    ? format(review.createdAt.toDate(), 'dd/MM/yyyy HH:mm') 
    : review.date;

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
            Ver Detalles
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleGenerateResponse} disabled={isGenerating}>
            <Sparkles className="mr-2 h-4 w-4" />
            {isGenerating ? "Generando..." : "Generar Respuesta con IA"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Details Modal */}
       <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalles de la Reseña</DialogTitle>
            <DialogDescription>
              Reseña completa de {review.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Cliente
              </Label>
              <span id="name" className="col-span-3 font-medium">{review.name}</span>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <span id="email" className="col-span-3 text-muted-foreground">{review.email}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Fecha
              </Label>
              <span id="date" className="col-span-3 text-muted-foreground">{formattedDate}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                Calificación
              </Label>
              <div className="col-span-3 flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < review.rating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="review" className="text-right pt-1">
                Comentario
              </Label>
              <p id="review" className="col-span-3 bg-muted p-3 rounded-md text-sm leading-relaxed">
                {review.review}
              </p>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cerrar
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* AI Response Modal */}
      <Dialog open={isAiDialogOpen} onOpenChange={setIsAiDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Borrador de respuesta para {review.name}</DialogTitle>
            <DialogDescription>
              Revisa la respuesta generada y edítala si es necesario antes de enviarla.
            </DialogDescription>
          </DialogHeader>
          <Textarea 
            value={draftResponse}
            onChange={(e) => setDraftResponse(e.target.value)}
            className="min-h-[150px]"
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsAiDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSendResponse}>Enviar Respuesta</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                    Esta acción no se puede deshacer. La reseña de <span className="font-bold">{review.name}</span> será eliminada permanentemente.
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

export const columns = [
  {
    accessorKey: "name",
    header: "Cliente",
    cell: ({ row }: { row: { original: Review } }) => (
      <div className="font-medium">{row.original.name}</div>
    ),
  },
  {
    accessorKey: "review",
    header: "Reseña",
    cell: ({ row }: { row: { original: Review } }) => (
      <p className="text-muted-foreground max-w-xs truncate">
        {row.original.review}
      </p>
    ),
  },
  {
    accessorKey: "date",
    header: "Fecha",
  },
  {
    accessorKey: "rating",
    header: "Calificación",
    cell: ({ row }: { row: { original: Review } }) => (
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < row.original.rating
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ActionsCell
  },
];


export const feedbackColumns = [
  {
    accessorKey: "name",
    header: "Cliente",
    cell: ({ row }: { row: { original: Review } }) => (
      <div className="font-medium">{row.original.name}</div>
    ),
  },
  {
    accessorKey: "review",
    header: "Reseña",
    cell: ({ row }: { row: { original: Review } }) => (
      <p className="text-muted-foreground max-w-xs truncate">
        {row.original.review}
      </p>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Fecha",
    cell: ({ row }: { row: { original: Review } }) => {
      const { createdAt } = row.original;
      if (createdAt && createdAt.toDate) {
        return format(createdAt.toDate(), 'dd/MM/yyyy HH:mm');
      }
      return 'N/A';
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }: { row: { original: Review } }) => {
      const status = row.original.status;
      const statusMap = {
        Pending: "Pendiente",
        Responded: "Respondido"
      }
      return (
        <Badge variant={status === "Pending" ? "destructive" : "secondary"}>
          {status ? statusMap[status] : "Desconocido"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ActionsCell,
  },
];