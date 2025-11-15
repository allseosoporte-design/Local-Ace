import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import type { Review } from "@/app/dashboard/reviews/columns";
import { cn } from "@/lib/utils";

interface RecentReviewsProps {
  reviews: Review[];
}

export function RecentReviews({ reviews }: RecentReviewsProps) {
  if (reviews.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-10">
        <p>No has recibido feedback reciente.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {reviews.map((review) => (
        <div className="flex items-center" key={review.id}>
          <Avatar className="h-9 w-9">
            <AvatarImage src={`https://avatar.vercel.sh/${review.email}.png`} alt="Avatar" />
            <AvatarFallback>{review.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{review.name}</p>
            <p className="text-sm text-muted-foreground">{review.email}</p>
          </div>
          <div className="ml-auto font-medium flex items-center gap-1">
            {review.rating} <Star className={cn("w-4 h-4", review.rating >= 4 ? "text-yellow-400 fill-yellow-400" : "text-gray-400 fill-gray-400")} />
          </div>
        </div>
      ))}
    </div>
  );
}
