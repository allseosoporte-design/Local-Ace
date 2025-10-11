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

export type Post = {
  id: string;
  content: string;
  status: "Published" | "Scheduled" | "Draft";
  publishDate: string;
};

export const columns = [
  {
    accessorKey: "content",
    header: "Content",
    cell: ({ row }: { row: { original: Post } }) => (
      <p className="max-w-md truncate">{row.original.content}</p>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }: { row: { original: Post } }) => {
      const status = row.original.status;
      let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
      if (status === "Published") variant = "default";
      if (status === "Scheduled") variant = "outline";

      return <Badge variant={variant}>{status}</Badge>;
    },
  },
  {
    accessorKey: "publishDate",
    header: "Publish Date",
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
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem>Reschedule</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        </div>
      );
    },
  },
];
