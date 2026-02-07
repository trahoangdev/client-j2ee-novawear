
import { cn } from "@/lib/utils";

interface SizeFilterProps {
    sizes: string[];
    selectedSizes: string[];
    onChange: (sizes: string[]) => void;
}

export function SizeFilter({ sizes, selectedSizes, onChange }: SizeFilterProps) {
    const toggleSize = (size: string) => {
        if (selectedSizes.includes(size)) {
            onChange(selectedSizes.filter((s) => s !== size));
        } else {
            onChange([...selectedSizes, size]);
        }
    };

    return (
        <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
                const isSelected = selectedSizes.includes(size);
                return (
                    <button
                        key={size}
                        type="button"
                        className={cn(
                            "h-10 min-w-[3rem] px-3 rounded-lg border text-sm font-medium transition-all",
                            isSelected
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background hover:bg-muted border-input text-foreground"
                        )}
                        onClick={() => toggleSize(size)}
                    >
                        {size}
                    </button>
                );
            })}
        </div>
    );
}
