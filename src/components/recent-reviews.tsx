import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { recentReviewsData } from "@/lib/data";

export function RecentReviews() {
  return (
    <div className="space-y-8">
      {recentReviewsData.map((review) => (
        <div className="flex items-center" key={review.id}>
          <Avatar className="h-9 w-9">
            <AvatarImage src={`https://avatar.vercel.sh/${review.email}.png`} alt="Avatar" />
            <AvatarFallback>{review.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{review.name}</p>
            <p className="text-sm text-muted-foreground">{review.email}</p>
          </div>
          <div className="ml-auto font-medium">+{review.rating} Stars</div>
        </div>
      ))}
    </div>
  );
}
