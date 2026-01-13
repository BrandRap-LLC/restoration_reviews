"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}

export function StarRating({
  rating,
  onRatingChange,
  readonly = false,
  size = "md",
}: StarRatingProps) {
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-7 h-7",
    lg: "w-10 h-10 sm:w-11 sm:h-11",
  };

  const handleClick = (index: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(index + 1);
    }
  };

  return (
    <div className="flex gap-2 sm:gap-3">
      {[...Array(5)].map((_, index) => (
        <button
          key={index}
          type="button"
          onClick={() => handleClick(index)}
          disabled={readonly}
          className={cn(
            "transition-all p-1 sm:p-1.5 -m-1 sm:-m-1.5",
            !readonly && "hover:scale-110 cursor-pointer",
            readonly && "cursor-default"
          )}
          aria-label={`Rate ${index + 1} stars`}
        >
          <Star
            className={cn(
              sizeClasses[size],
              "transition-colors",
              index < rating
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 text-gray-300"
            )}
          />
        </button>
      ))}
    </div>
  );
}
