import { Search, Grid3x3, List, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Clinica } from "@/services/health.service";

interface ResultsHeaderBarProps {
  sortBy: string;
  onSortChange: (value: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (value: "grid" | "list") => void;
  filteredPlansCount: number;
  onOpenFilters: () => void;
  allClinicas: Clinica[];
  selectedClinicas: Clinica[];
  onToggleClinica: (clinica: Clinica) => void;
  onRemoveClinica: (clinicaId: string) => void;
  openClinicSearch: boolean;
  onOpenClinicSearchChange: (open: boolean) => void;
}

export const ResultsHeaderBar = ({
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  filteredPlansCount,
  onOpenFilters,
  allClinicas,
  selectedClinicas,
  onToggleClinica,
  onRemoveClinica,
  openClinicSearch,
  onOpenClinicSearchChange,
}: ResultsHeaderBarProps) => {
  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-4">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={onOpenFilters}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filtros
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        {/* Clinic Search */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex-1 w-full md:max-w-md">
            <Popover open={openClinicSearch} onOpenChange={onOpenClinicSearchChange}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openClinicSearch}
                  className="w-full justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Buscar clínicas...</span>
                  </div>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Buscar clínicas..." />
                  <CommandList>
                    <CommandEmpty>No se encontraron clínicas.</CommandEmpty>
                    <CommandGroup>
                      {allClinicas
                        .filter(clinica => 
                          !selectedClinicas.find(c => c.item_id === clinica.item_id)
                        )
                        .map((clinica) => (
                        <CommandItem
                          key={clinica.item_id}
                          onSelect={() => {
                            onToggleClinica(clinica);
                            onOpenClinicSearchChange(false);
                          }}
                        >
                          {clinica.entity}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            
            {/* Selected clinics badges */}
            {selectedClinicas.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedClinicas.map((clinica) => (
                  <Badge
                    key={clinica.item_id}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => onRemoveClinica(clinica.item_id)}
                  >
                    {clinica.entity}
                    <span className="ml-1">×</span>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sorting and View Mode */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-full sm:w-[240px]">
              <SelectValue placeholder="Ordenar por..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Sin ordenar</SelectItem>
              <SelectItem value="price-asc">Precio: Menor a Mayor</SelectItem>
              <SelectItem value="price-desc">Precio: Mayor a Menor</SelectItem>
              <SelectItem value="name-asc">Empresa: A-Z</SelectItem>
            </SelectContent>
          </Select>

          <RadioGroup
            value={viewMode}
            onValueChange={(value) => onViewModeChange(value as "grid" | "list")}
            className="flex gap-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="grid" id="grid" />
              <Label htmlFor="grid" className="cursor-pointer flex items-center gap-1">
                <Grid3x3 className="h-4 w-4" />
                Grid
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="list" id="list" />
              <Label htmlFor="list" className="cursor-pointer flex items-center gap-1">
                <List className="h-4 w-4" />
                Lista
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="text-sm text-muted-foreground">
          {filteredPlansCount} planes encontrados
        </div>
      </div>
    </div>
  );
};
