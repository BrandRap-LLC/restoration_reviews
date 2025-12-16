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
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const handleClick = (index: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(index + 1);
    }
  };

  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, index) => (
        <button
          key={index}
          type="button"
          onClick={() => handleClick(index)}
          disabled={readonly}
          className={cn(
            "transition-all",
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
