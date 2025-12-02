import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

interface ResultsFilterSidebarProps {
  priceRange: number[];
  onPriceRangeChange: (value: number[]) => void;
  providers: string[];
  selectedProviders: string[];
  onToggleProvider: (provider: string) => void;
  minRating: number[];
  onMinRatingChange: (value: number[]) => void;
  onClearFilters: () => void;
}

export const ResultsFilterSidebar = ({
  priceRange,
  onPriceRangeChange,
  providers,
  selectedProviders,
  onToggleProvider,
  minRating,
  onMinRatingChange,
  onClearFilters,
}: ResultsFilterSidebarProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-foreground">Filtros</h2>
    
      {/* Rango de Precio */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Rango de Precio</Label>
        <Slider
          min={0}
          max={600}
          step={10}
          value={priceRange}
          onValueChange={onPriceRangeChange}
          className="mb-2"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>${priceRange[0]}</span>
          <span>${priceRange[1]}</span>
        </div>
      </div>

      {/* Proveedores */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Proveedores</Label>
        <div className="space-y-3">
          {providers.map(provider => (
            <div key={provider} className="flex items-center space-x-2">
              <Checkbox
                id={provider}
                checked={selectedProviders.includes(provider)}
                onCheckedChange={() => onToggleProvider(provider)}
              />
              <label
                htmlFor={provider}
                className="text-sm text-foreground cursor-pointer"
              >
                {provider}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Rating Mínimo */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Calificación Mínima</Label>
        <Slider
          min={0}
          max={5}
          step={0.5}
          value={minRating}
          onValueChange={onMinRatingChange}
          className="mb-2"
        />
        <div className="text-sm text-muted-foreground">
          {minRating[0]} estrellas o más
        </div>
      </div>

      <Button 
        variant="outline" 
        className="w-full"
        onClick={onClearFilters}
      >
        Limpiar Filtros
      </Button>
    </div>
  );
};
