"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import type { AutomatedPost } from "@/types/automated-post";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type ActionsCellProps = {
  row: {
    original: AutomatedPost;
  };
  onEdit: (post: AutomatedPost) => void;
  onDelete: (post: AutomatedPost) => void;
};

const ActionsCell = ({ row, onEdit, onDelete }: ActionsCellProps) => {
  const post = row.original;

  return (
    <div className="text-right">
        <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menú</span>
            <MoreHorizontal className="h-4 w-4" />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEdit(post)}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(post)} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
            </DropdownMenuItem>
        </DropdownMenuContent>
        </DropdownMenu>
    </div>
  );
};


export const getColumns = (
  onEdit: (post: AutomatedPost) => void,
  onDelete: (post: AutomatedPost) => void
): ColumnDef<AutomatedPost>[] => [
  {
    accessorKey: "content",
    header: "Contenido",
    cell: ({ row }) => (
      <p className="max-w-md truncate">{row.original.content}</p>
    ),
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.original.status;
      let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
      if (status === "Published") variant = "default";
      if (status === "Scheduled") variant = "outline";

      const statusMap = {
        Published: "Publicado",
        Scheduled: "Programado",
        Draft: "Borrador"
      }

      return <Badge variant={variant}>{statusMap[status]}</Badge>;
    },
  },
  {
    accessorKey: "scheduledDate",
    header: "Fecha de Publicación",
    cell: ({ row }) => {
        const { scheduledDate, status } = row.original;
        if (status === 'Draft' || !scheduledDate) {
            return "N/A";
        }
        // Firestore Timestamps need to be converted to Date objects
        const date = scheduledDate.toDate ? scheduledDate.toDate() : new Date(scheduledDate);
        return format(date, "dd/MM/yyyy HH:mm", { locale: es });
    },
  },
  {
    id: "actions",
    cell: (props) => <ActionsCell {...props} onEdit={onEdit} onDelete={onDelete} />,
  },
];
