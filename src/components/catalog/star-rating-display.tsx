
'use client';

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingDisplayProps {
  productId: string;
  rating: number;
  ratingCount?: number;
  className?: string;
  onRatingSubmit?: (rating: number) => void;
  isSubmitting?: boolean;
}

export function StarRatingDisplay({ 
  productId,
  rating, 
  ratingCount, 
  className,
  onRatingSubmit,
  isSubmitting
}: StarRatingDisplayProps) {
  const [hover, setHover] = useState(0);
  const [userRating, setUserRating] = useState(0);

  useEffect(() => {
    const storedRating = localStorage.getItem(`rating_${productId}`);
    if (storedRating) {
      setUserRating(Number(storedRating));
    }
  }, [productId]);

  const handleClick = (ratingValue: number) => {
    if (isSubmitting || userRating > 0 || !onRatingSubmit) return; // Prevent re-rating
    
    setUserRating(ratingValue);
    localStorage.setItem(`rating_${productId}`, String(ratingValue));
    onRatingSubmit(ratingValue);
  };
  
  const displayRating = userRating > 0 ? userRating : rating;
  const fullStars = Math.floor(displayRating);
  const halfStar = displayRating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  const starArray = [...Array(5)].map((_, index) => {
    const ratingValue = index + 1;
    let starState: 'full' | 'half' | 'empty' = 'empty';

    if (onRatingSubmit && !isSubmitting && userRating === 0) { // Interactive mode
      if (ratingValue <= (hover || displayRating)) {
        starState = 'full';
      }
    } else { // Display mode (or while submitting)
      if (ratingValue <= fullStars) {
        starState = 'full';
      } else if (halfStar && ratingValue === fullStars + 1) {
        starState = 'half';
      }
    }
    
    return (
       <Star
          key={ratingValue}
          onClick={() => onRatingSubmit && handleClick(ratingValue)}
          onMouseEnter={() => onRatingSubmit && setHover(ratingValue)}
          onMouseLeave={() => onRatingSubmit && setHover(0)}
          className={cn("h-5 w-5 transition-all duration-200", 
            onRatingSubmit && userRating === 0 && !isSubmitting ? "cursor-pointer transform hover:scale-125" : "cursor-default",
            starState === 'full' ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-gray-300'
          )}
        />
    )
  });

  return (
    <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
      <div className="flex items-center">
        {starArray}
      </div>
      <span className="font-medium text-foreground">{rating.toFixed(1)}</span>
      {ratingCount !== undefined && <span>({ratingCount})</span>}
      {userRating > 0 && <span className="text-xs text-primary">(¡Gracias!)</span>}
    </div>
  );
}
