import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Grid3x3, List, Plus, Minus } from "lucide-react";
import FormQuote from "@/components/FormQuote";
import { FloatingQuoteButton } from "@/components/FloatingQuoteButton";
import { ComparisonBar } from "@/components/ComparisonBar";
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
import { Dialog, DialogContent } from "@/components/ui/dialog";

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

const ResultadosPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [priceRange, setPriceRange] = useState([0, 600]);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [minRating, setMinRating] = useState([0]);
  const [healthPlans, setHealthPlans] = useState<HealthPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [formQuoteOpen, setFormQuoteOpen] = useState(false);

  const [selectedClinicas, setSelectedClinicas] = useState<Clinica[]>([]);
  const [openClinicSearch, setOpenClinicSearch] = useState(false);
  const [comparisonPlans, setComparisonPlans] = useState<string[]>([]);

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

  const handleCompare = () => {
    // Store comparison data in sessionStorage to pass to comparison page
    sessionStorage.setItem('comparisonPlans', JSON.stringify(comparisonPlansList));
    sessionStorage.setItem('allPlans', JSON.stringify(healthPlans));
    navigate('/comparar');
  };

  return (
    <div className="min-h-screen bg-background">
      <FloatingQuoteButton onClick={() => setFormQuoteOpen(true)} />
      
      <Dialog open={formQuoteOpen} onOpenChange={setFormQuoteOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0">
          <div className="w-full h-full">
            <FormQuote />
          </div>
        </DialogContent>
      </Dialog>

      <ComparisonBar 
        plans={comparisonPlansList}
        onRemove={toggleComparison}
        onCompare={handleCompare}
        isComparisonModalOpen={false}
      />
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary/5 via-background to-secondary/20 border-b border-border">
        <div className="container mx-auto px-6 py-12 lg:py-16">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground">
                Encontrá el plan perfecto
              </h1>
              <p className="text-lg text-muted-foreground">
                Compará cobertura, precio y beneficios de los mejores planes de salud
              </p>
              <div className="flex gap-3 text-sm text-muted-foreground">
                <Badge variant="secondary">{healthPlans.length} planes disponibles</Badge>
                <Badge variant="secondary">{providers.length} prepagas</Badge>
              </div>
            </div>
            <div className="relative h-64 lg:h-80 rounded-xl overflow-hidden shadow-2xl border border-border bg-muted/30">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                <div className="text-center text-muted-foreground p-8">
                  <Search className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">Comparador inteligente de planes de salud</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Bar */}
      <div className="bg-muted/30 border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <p className="text-sm text-center text-muted-foreground">
            🔍 Usá los filtros para encontrar el plan ideal para vos y tu familia
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-[320px_1fr] gap-6">
          {/* Sidebar de Filtros */}
          <aside className="bg-card border border-border rounded-xl p-6 h-fit lg:sticky lg:top-6 shadow-sm">
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
              className="w-full mt-2"
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
          <main className="flex-1 space-y-6">
            {/* Header */}
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
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
                  ? "grid grid-cols-1 md:grid-cols-2 gap-6"
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
              <div className="text-center py-12 bg-card border border-border rounded-xl p-8">
                <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No se encontraron planes con los filtros seleccionados</p>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Additional Sections */}
      <div className="bg-muted/30 border-t border-border">
        <div className="container mx-auto px-6 py-16">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="space-y-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Búsqueda inteligente</h3>
              <p className="text-sm text-muted-foreground">Filtrá por precio, cobertura, clínicas y más</p>
            </div>
            <div className="space-y-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Grid3x3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Comparación fácil</h3>
              <p className="text-sm text-muted-foreground">Compará hasta 4 planes lado a lado</p>
            </div>
            <div className="space-y-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Cotización gratuita</h3>
              <p className="text-sm text-muted-foreground">Solicitá tu cotización sin compromiso</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-card border-t border-border">
        <div className="container mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Comparador de Planes</h4>
              <p className="text-sm text-muted-foreground">
                La forma más simple de encontrar tu plan de salud ideal
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground text-sm">Empresa</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Sobre nosotros</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contacto</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Trabaja con nosotros</a></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground text-sm">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Términos y condiciones</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Política de privacidad</a></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground text-sm">Ayuda</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Preguntas frecuentes</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Cómo funciona</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Comparador de Planes de Salud. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ResultadosPage;
