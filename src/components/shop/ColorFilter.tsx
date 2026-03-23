import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import type { ProductColorDto } from "@/types/api";

interface ColorFilterProps {
    colors: ProductColorDto[];
    selectedColors: string[];
    onChange: (colors: string[]) => void;
}

export function ColorFilter({ colors, selectedColors, onChange }: ColorFilterProps) {
    const toggleColor = (colorName: string) => {
        if (selectedColors.includes(colorName)) {
            onChange(selectedColors.filter((c) => c !== colorName));
        } else {
            onChange([...selectedColors, colorName]);
        }
    };

    return (
        <div className="flex flex-wrap gap-2">
            {colors.map((colorObj, index) => {
                const isString = typeof colorObj === 'string';
                const colorName = isString ? colorObj : colorObj.name;
                const hex = isString ? '#CCCCCC' : (colorObj.hex || '#CCCCCC');
                
                if (!colorName) return null;

                const isSelected = selectedColors.includes(colorName);
                const isWhite = hex.toLowerCase() === '#ffffff' || colorName.toLowerCase() === 'trắng';

                return (
                    <button
                        key={colorName || index}
                        type="button"
                        className={cn(
                            "h-8 w-8 rounded-full border flex items-center justify-center transition-all shadow-sm",
                            isSelected ? "ring-2 ring-primary ring-offset-2 scale-110" : "hover:scale-110",
                            isWhite ? "border-foreground/20" : "border-transparent"
                        )}
                        style={{ backgroundColor: hex }}
                        onClick={() => toggleColor(colorName)}
                        title={colorName}
                    >
                        {isSelected && <Check className={cn("h-4 w-4", isWhite ? "text-black" : "text-white")} />}
                    </button>
                );
            })}
        </div>
    );
}
