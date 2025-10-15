"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Sparkles, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { generateReviewResponse } from "@/ai/flows/generate-review-response";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Timestamp } from "firebase/firestore";
import { format } from "date-fns";

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
      setIsDialogOpen(true);
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
    setIsDialogOpen(false);
  };

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
          <DropdownMenuItem
            onClick={() => alert(`Viendo detalles de ${review.name}`)}
          >
            Ver Detalles
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleGenerateResponse} disabled={isGenerating}>
            <Sparkles className="mr-2 h-4 w-4" />
            {isGenerating ? "Generando..." : "Generar Respuesta con IA"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSendResponse}>Enviar Respuesta</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
