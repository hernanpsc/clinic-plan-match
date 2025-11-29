import { useState, useEffect } from "react";
import { Search, Grid3x3, List, Plus, Minus } from "lucide-react";
import { QuoteModal } from "@/components/QuoteModal";
import { FloatingQuoteButton } from "@/components/FloatingQuoteButton";
import { ComparisonBar } from "@/components/ComparisonBar";
import { HealthPlanComparisonModal } from "@/components/HealthPlanComparisonModal";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Attribute {
  name: string;
  value_name: string;
  attribute_group_name: string;
}

interface Clinica {
  item_id: string;
  nombre: string;
  entity: string;
}

interface Image {
  id: string;
  descripcion: string;
  empresa: string;
  url: string;
}

interface HealthPlan {
  _id: string;
  name: string;
  empresa: string;
  price: number;
  rating: number;
  linea: string;
  attributes?: Attribute[];
  clinicas?: Clinica[];
  images?: Image[];
}

const Index = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [priceRange, setPriceRange] = useState([0, 600]);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [minRating, setMinRating] = useState([0]);
  const [healthPlans, setHealthPlans] = useState<HealthPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [selectedClinicas, setSelectedClinicas] = useState<Clinica[]>([]);
  const [openClinicSearch, setOpenClinicSearch] = useState(false);
  const [comparisonPlans, setComparisonPlans] = useState<string[]>([]);
  const [comparisonModalOpen, setComparisonModalOpen] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch('https://servidorplus.avalianonline.com.ar/planes');
        const data = await response.json();
        setHealthPlans(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudieron cargar los planes",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [toast]);

  const providers = Array.from(new Set(healthPlans.map(p => p.empresa)));
  
  // Extract all unique clinics from all plans
  const allClinicas = healthPlans.reduce((acc: Clinica[], plan) => {
    if (plan.clinicas) {
      plan.clinicas.forEach(clinica => {
        if (!acc.find(c => c.item_id === clinica.item_id)) {
          acc.push(clinica);
        }
      });
    }
    return acc;
  }, []);

  const filteredPlans = healthPlans.filter(plan => {
    const matchesPrice = plan.price >= priceRange[0] && plan.price <= priceRange[1];
    const matchesProvider = selectedProviders.length === 0 || selectedProviders.includes(plan.empresa);
    const matchesRating = plan.rating >= minRating[0];
    const matchesClinica = selectedClinicas.length === 0 || 
      selectedClinicas.some(selectedClinica => 
        plan.clinicas?.some(planClinica => planClinica.item_id === selectedClinica.item_id)
      );
    
    return matchesPrice && matchesProvider && matchesRating && matchesClinica;
  });

  const toggleProvider = (provider: string) => {
    setSelectedProviders(prev =>
      prev.includes(provider)
        ? prev.filter(p => p !== provider)
        : [...prev, provider]
    );
  };

  const toggleClinica = (clinica: Clinica) => {
    setSelectedClinicas(prev => {
      const exists = prev.find(c => c.item_id === clinica.item_id);
      if (exists) {
        return prev.filter(c => c.item_id !== clinica.item_id);
      }
      return [...prev, clinica];
    });
  };

  const removeClinica = (clinicaId: string) => {
    setSelectedClinicas(prev => prev.filter(c => c.item_id !== clinicaId));
  };

  const toggleComparison = (planId: string) => {
    setComparisonPlans(prev => 
      prev.includes(planId) 
        ? prev.filter(id => id !== planId)
        : [...prev, planId]
    );
  };

  const comparisonPlansList = healthPlans.filter(plan => 
    comparisonPlans.includes(plan._id)
  );

  const handleAddPlanToComparison = (planId: string) => {
    if (comparisonPlans.length < 3 && !comparisonPlans.includes(planId)) {
      setComparisonPlans(prev => [...prev, planId]);
    }
  };

  const handleRemovePlanFromComparison = (planId: string) => {
    setComparisonPlans(prev => prev.filter(id => id !== planId));
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      <FloatingQuoteButton onClick={() => setQuoteModalOpen(true)} />
      <QuoteModal open={quoteModalOpen} onOpenChange={setQuoteModalOpen} />
      <HealthPlanComparisonModal
        plansToCompare={comparisonPlansList}
        allAvailablePlans={healthPlans}
        onAddPlan={handleAddPlanToComparison}
        onRemovePlan={handleRemovePlanFromComparison}
        open={comparisonModalOpen}
        onOpenChange={setComparisonModalOpen}
      />
      <ComparisonBar 
        plans={comparisonPlansList}
        onRemove={toggleComparison}
        onCompare={() => setComparisonModalOpen(true)}
        isComparisonModalOpen={comparisonModalOpen}
      />
      
      <div className="flex">
        {/* Sidebar de Filtros */}
        <aside className="w-80 bg-background border-r border-border p-6 sticky top-0 h-screen overflow-y-auto">
          <h2 className="text-xl font-semibold mb-6 text-foreground">Filtros</h2>
          
          {/* Rango de Precio */}
          <div className="mb-8">
            <Label className="text-sm font-medium mb-3 block">Rango de Precio</Label>
            <Slider
              min={0}
              max={600}
              step={10}
              value={priceRange}
              onValueChange={setPriceRange}
              className="mb-2"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}</span>
            </div>
          </div>

          {/* Proveedores */}
          <div className="mb-8">
            <Label className="text-sm font-medium mb-3 block">Proveedores</Label>
            <div className="space-y-3">
              {providers.map(provider => (
                <div key={provider} className="flex items-center space-x-2">
                  <Checkbox
                    id={provider}
                    checked={selectedProviders.includes(provider)}
                    onCheckedChange={() => toggleProvider(provider)}
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
          <div className="mb-8">
            <Label className="text-sm font-medium mb-3 block">Calificación Mínima</Label>
            <Slider
              min={0}
              max={5}
              step={0.5}
              value={minRating}
              onValueChange={setMinRating}
              className="mb-2"
            />
            <div className="text-sm text-muted-foreground">
              {minRating[0]} estrellas o más
            </div>
          </div>

            <Button 
            variant="outline" 
            className="w-full"
            onClick={() => {
              setPriceRange([0, 600]);
              setSelectedProviders([]);
              setMinRating([0]);
              setSelectedClinicas([]);
            }}
          >
            Limpiar Filtros
          </Button>
        </aside>

        {/* Contenido Principal */}
        <main className="flex-1 p-6">
          {/* Header */}
          <div className="bg-background rounded-lg border border-border p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex-1 w-full md:max-w-md">
                <Popover open={openClinicSearch} onOpenChange={setOpenClinicSearch}>
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
                                toggleClinica(clinica);
                                setOpenClinicSearch(false);
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
                        onClick={() => removeClinica(clinica.item_id)}
                      >
                        {clinica.entity}
                        <span className="ml-1">×</span>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <RadioGroup
                value={viewMode}
                onValueChange={(value) => setViewMode(value as "grid" | "list")}
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

            <div className="mt-3 text-sm text-muted-foreground">
              {filteredPlans.length} planes encontrados
            </div>
          </div>

          {/* Cards Grid/List */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Cargando planes...</p>
            </div>
          ) : (
            <div className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "flex flex-col gap-4"
            }>
            {filteredPlans.map(plan => (
              <Card key={plan._id} className={viewMode === "list" ? "flex flex-col md:flex-row" : ""}>
                <div className="flex-1">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        {plan.images && plan.images[0] && (
                          <img
                            src={`/${plan.images[0].url}`}
                            alt={plan.empresa}
                            className="w-12 h-12 object-contain flex-shrink-0"
                          />
                        )}
                        <div>
                          <CardTitle className="text-lg">{plan.name}</CardTitle>
                          <CardDescription>{plan.empresa}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-accent px-2 py-1 rounded flex-shrink-0">
                        <span className="text-sm font-medium">⭐ {plan.rating}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{plan.linea}</p>
                    <ul className="space-y-1">
                      {plan.attributes?.slice(0, 4).map((attr, idx) => (
                        <li key={`${plan._id}-attr-${idx}`} className="text-sm flex items-center gap-2">
                          <span className="text-primary">✓</span>
                          <span className="font-medium">{attr.name}:</span> {attr.value_name}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </div>
                <CardFooter className={`flex ${viewMode === "list" ? "md:flex-col md:justify-center md:items-end md:min-w-[200px]" : "flex-col"} gap-3`}>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">${plan.price}</div>
                    <div className="text-xs text-muted-foreground">por mes</div>
                  </div>
                  <div className="flex gap-2 w-full">
                    <Button 
                      variant={comparisonPlans.includes(plan._id) ? "default" : "outline"}
                      size="icon"
                      onClick={() => toggleComparison(plan._id)}
                      title={comparisonPlans.includes(plan._id) ? "Remover de comparación" : "Agregar a comparación"}
                    >
                      {comparisonPlans.includes(plan._id) ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </Button>
                    <Button className="flex-1">Ver Detalles</Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
            </div>
          )}

          {!loading && filteredPlans.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No se encontraron planes con los filtros seleccionados</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Index;
