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
        industry: "Cafe",
        customerSentiment: review.rating >= 4 ? "positive" : "negative",
      });
      setDraftResponse(result.draftResponse);
      setIsDialogOpen(true);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate AI response.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendResponse = () => {
    console.log("Sending response:", draftResponse);
    toast({
      title: "Response Sent!",
      description: "Your response has been sent to the customer.",
    });
    setIsDialogOpen(false);
  };

  return (
    <>
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
            onClick={() => alert(`Viewing details for ${review.name}`)}
          >
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleGenerateResponse} disabled={isGenerating}>
            <Sparkles className="mr-2 h-4 w-4" />
            {isGenerating ? "Generating..." : "Generate AI Response"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Draft Response for {review.name}</DialogTitle>
            <DialogDescription>
              Review the generated response and edit if needed before sending.
            </DialogDescription>
          </DialogHeader>
          <Textarea 
            value={draftResponse}
            onChange={(e) => setDraftResponse(e.target.value)}
            className="min-h-[150px]"
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSendResponse}>Send Response</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
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
    accessorKey: "date",
    header: "Date",
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
    id: "actions",
    cell: ActionsCell
  },
];


export const feedbackColumns = [
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
    accessorKey: "date",
    header: "Date",
  },
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
    cell: ActionsCell,
  },
];
