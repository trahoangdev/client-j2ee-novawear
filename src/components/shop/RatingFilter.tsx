
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingFilterProps {
    rating: number | undefined;
    onChange: (rating: number | undefined) => void;
}

export function RatingFilter({ rating, onChange }: RatingFilterProps) {
    const options = [5, 4, 3, 2, 1];

    return (
        <div className="space-y-2">
            {options.map((val) => {
                const isSelected = rating === val;
                return (
                    <div
                        key={val}
                        className="flex items-center gap-2 cursor-pointer hover:bg-muted p-1 rounded transition-colors"
                        onClick={() => {
                            if (isSelected) {
                                onChange(undefined);
                            } else {
                                onChange(val);
                            }
                        }}
                    >
                        <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                    key={i}
                                    className={cn(
                                        "h-4 w-4",
                                        i < val ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                    )}
                                />
                            ))}
                        </div>
                        <span className={cn("text-sm", isSelected ? "font-bold" : "text-muted-foreground")}>
                            {val === 5 ? "" : "Trở lên"}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
