import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface ColorFilterProps {
    colors: string[];
    selectedColors: string[];
    onChange: (colors: string[]) => void;
}

export function ColorFilter({ colors, selectedColors, onChange }: ColorFilterProps) {
    const toggleColor = (color: string) => {
        if (selectedColors.includes(color)) {
            onChange(selectedColors.filter((c) => c !== color));
        } else {
            onChange([...selectedColors, color]);
        }
    };

    // Predefined hex map for common colors (could be improved)
    const colorMap: Record<string, string> = {
        'Đen': '#000000',
        'Trắng': '#FFFFFF',
        'Xám': '#808080',
        'Xanh dương': '#0000FF',
        'Đỏ': '#FF0000',
        'Vàng': '#FFFF00',
        'Hồng': '#FFC0CB',
        'Cam': '#FFA500',
        'Tím': '#800080',
        'Nâu': '#A52A2A',
        'Be': '#F5F5DC',
        'Kem': '#FFFDD0',
        'Xanh lá': '#008000',
    };

    return (
        <div className="flex flex-wrap gap-2">
            {colors.map((color) => {
                const hex = colorMap[color] || '#CCCCCC';
                const isSelected = selectedColors.includes(color);
                const isWhite = hex.toLowerCase() === '#ffffff' || color === 'Trắng';

                return (
                    <button
                        key={color}
                        type="button"
                        className={cn(
                            "h-8 w-8 rounded-full border flex items-center justify-center transition-all",
                            isSelected ? "ring-2 ring-primary ring-offset-2" : "hover:scale-110",
                            isWhite ? "border-gray-200" : "border-transparent"
                        )}
                        style={{ backgroundColor: hex }}
                        onClick={() => toggleColor(color)}
                        title={color}
                    >
                        {isSelected && <Check className={cn("h-4 w-4", isWhite ? "text-black" : "text-white")} />}
                    </button>
                );
            })}
        </div>
    );
}
