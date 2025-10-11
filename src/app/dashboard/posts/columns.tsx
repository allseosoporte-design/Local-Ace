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
import { MoreHorizontal } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

export type Post = {
  id: string;
  content: string;
  status: "Published" | "Scheduled" | "Draft";
  publishDate: string;
};

export const columns: ColumnDef<Post>[] = [
  {
    accessorKey: "content",
    header: "Contenido",
    cell: ({ row }: { row: { original: Post } }) => (
      <p className="max-w-md truncate">{row.original.content}</p>
    ),
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }: { row: { original: Post } }) => {
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
    accessorKey: "publishDate",
    header: "Fecha de Publicación",
    cell: ({ row }: { row: { original: Post } }) => (
      <span>{row.original.publishDate || "N/A"}</span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }: { row: { original: Post } }) => {
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
                <DropdownMenuItem>Editar</DropdownMenuItem>
                <DropdownMenuItem>Reprogramar</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">Eliminar</DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        </div>
      );
    },
  },
];
