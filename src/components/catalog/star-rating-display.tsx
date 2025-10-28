'use client';

import { Star, StarHalf } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingDisplayProps {
  rating: number;
  ratingCount?: number;
  className?: string;
}

export function StarRatingDisplay({ rating, ratingCount, className }: StarRatingDisplayProps) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
        ))}
        {halfStar && <StarHalf className="h-5 w-5 fill-yellow-400 text-yellow-400" />}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="h-5 w-5 fill-gray-300 text-gray-300" />
        ))}
      </div>
      <span className="font-medium text-foreground">{rating.toFixed(1)}</span>
      {ratingCount !== undefined && <span>({ratingCount})</span>}
    </div>
  );
}
