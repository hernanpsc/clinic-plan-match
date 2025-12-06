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
    <>
      <div className="bg-card rounded-xl border border-border p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col gap-4">
          {/* Clinic Search - Full width on mobile */}
          <div className="flex flex-col gap-4">
            <div className="w-full">
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
                <PopoverContent className="w-[min(400px,90vw)] p-0" align="start">
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

            {/* Plans count - visible on all devices */}
            <div className="text-sm text-muted-foreground">
              {filteredPlansCount} planes encontrados
            </div>
          </div>

          {/* Sorting and View Mode - Hidden on mobile */}
          <div className="hidden sm:flex flex-row gap-3 items-center justify-between">
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="w-[240px]">
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
        </div>
      </div>

      {/* Floating Filter Button - Mobile Only */}
      <Button
        onClick={onOpenFilters}
        className="fixed bottom-6 right-6 z-50 lg:hidden rounded-full h-14 w-14 shadow-lg"
        size="icon"
      >
        <Filter className="h-6 w-6" />
      </Button>
    </>
  );
};
