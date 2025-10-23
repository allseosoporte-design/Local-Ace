
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Timestamp, doc, deleteDoc } from "firebase/firestore";
import { format } from "date-fns";
import { useFirestore, useUser } from "@/firebase";

export type Message = {
  id: string;
  nombre: string;
  correo: string;
  mensaje: string;
  submittedAt: Timestamp;
};

const ActionsCell = ({ row }: { row: { original: Message } }) => {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const message = row.original;

  const handleDelete = async () => {
    if (!firestore || !user) return;
    try {
      const docRef = doc(firestore, `businesses/${user.uid}/contactSubmissions`, message.id);
      await deleteDoc(docRef);
      toast({
        title: "Mensaje eliminado",
        description: "El mensaje ha sido eliminado permanentemente."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al eliminar",
        description: "No se pudo eliminar el mensaje de la base de datos."
      });
    }
  };

  const formattedDate = message.submittedAt 
    ? format(message.submittedAt.toDate(), 'dd/MM/yyyy HH:mm') 
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
            <Eye className="mr-2 h-4 w-4" />
            Ver Mensaje
          </DropdownMenuItem>
          <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalles del Mensaje</DialogTitle>
            <DialogDescription>
              Mensaje completo de {message.nombre}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">De:</Label>
              <span className="col-span-3 font-medium">{message.nombre}</span>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Email:</Label>
              <a href={`mailto:${message.correo}`} className="col-span-3 text-primary underline">{message.correo}</a>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Fecha:</Label>
              <span className="col-span-3 text-muted-foreground">{formattedDate}</span>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-1">Mensaje:</Label>
              <p className="col-span-3 bg-muted p-3 rounded-md text-sm leading-relaxed whitespace-pre-wrap">
                {message.mensaje}
              </p>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">Cerrar</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export const columns = [
  {
    accessorKey: "nombre",
    header: "Remitente",
  },
  {
    accessorKey: "mensaje",
    header: "Mensaje",
    cell: ({ row }: { row: { original: Message } }) => (
      <p className="text-muted-foreground max-w-xs truncate">
        {row.original.mensaje}
      </p>
    ),
  },
  {
    accessorKey: "submittedAt",
    header: "Fecha",
     cell: ({ row }: { row: { original: Message } }) => {
      const { submittedAt } = row.original;
      if (submittedAt && submittedAt.toDate) {
        return format(submittedAt.toDate(), 'dd/MM/yyyy HH:mm');
      }
      return 'N/A';
    },
  },
  {
    id: "actions",
    cell: ActionsCell,
  },
];
