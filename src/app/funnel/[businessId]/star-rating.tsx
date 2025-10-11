"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  onRating: (rating: number) => void;
  totalStars?: number;
}

export function StarRating({ onRating, totalStars = 5 }: StarRatingProps) {
  const [hover, setHover] = useState(0);
  const [rating, setRating] = useState(0);

  const handleClick = (ratingValue: number) => {
    setRating(ratingValue);
    onRating(ratingValue);
  };

  return (
    <div className="flex justify-center space-x-2 py-4">
      {[...Array(totalStars)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <label key={ratingValue}>
            <input
              type="radio"
              name="rating"
              className="sr-only"
              value={ratingValue}
              onClick={() => handleClick(ratingValue)}
            />
            <Star
              className={cn(
                "h-12 w-12 cursor-pointer transition-colors duration-200",
                ratingValue <= (hover || rating)
                  ? "text-yellow-400"
                  : "text-gray-300"
              )}
              fill={
                ratingValue <= (hover || rating)
                  ? "currentColor"
                  : "transparent"
              }
              onMouseEnter={() => setHover(ratingValue)}
              onMouseLeave={() => setHover(0)}
            />
          </label>
        );
      })}
    </div>
  );
}
