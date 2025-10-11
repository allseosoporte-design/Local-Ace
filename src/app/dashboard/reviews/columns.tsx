"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// This type is manually created for demonstration.
// In a real app, you would generate this from your database schema.
export type Review = {
  id: string;
  name: string;
  email: string;
  rating: number;
  review: string;
  date: string;
  status?: "Pending" | "Responded";
};

export const columns = [
  {
    accessorKey: "name",
    header: "Customer",
    cell: ({ row }: { row: { original: Review } }) => (
      <div className="font-medium">{row.original.name}</div>
    ),
  },
  {
    accessorKey: "review",
    header: "Review",
    cell: ({ row }: { row: { original: Review } }) => (
      <p className="text-muted-foreground max-w-xs truncate">
        {row.original.review}
      </p>
    ),
  },
  {
    accessorKey: "rating",
    header: "Rating",
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
    accessorKey: "date",
    header: "Date",
  },
  {
    id: "actions",
    cell: ({ row }: { row: { original: Review } }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => alert(`Viewing details for ${row.original.name}`)}
            >
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate AI Response
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export const feedbackColumns = [
  ...columns.filter((c) => c.accessorKey !== "rating"),
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }: { row: { original: Review } }) => {
      const status = row.original.status;
      return (
        <Badge variant={status === "Pending" ? "destructive" : "secondary"}>
          {status}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }: { row: { original: Review } }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => alert(`Viewing details for ${row.original.name}`)}
            >
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate AI Response
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
