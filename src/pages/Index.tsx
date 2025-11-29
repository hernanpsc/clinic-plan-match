import { useState, useEffect } from "react";
import { Search, Grid3x3, List } from "lucide-react";
import { QuoteModal } from "@/components/QuoteModal";
import { FloatingQuoteButton } from "@/components/FloatingQuoteButton";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Attribute {
  name: string;
  value_name: string;
  attribute_group_name: string;
}

interface HealthPlan {
  _id: string;
  name: string;
  empresa: string;
  price: number;
  rating: number;
  linea: string;
  attributes?: Attribute[];
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

  const filteredPlans = healthPlans.filter(plan => {
    const matchesSearch = plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.empresa.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPrice = plan.price >= priceRange[0] && plan.price <= priceRange[1];
    const matchesProvider = selectedProviders.length === 0 || selectedProviders.includes(plan.empresa);
    const matchesRating = plan.rating >= minRating[0];
    
    return matchesSearch && matchesPrice && matchesProvider && matchesRating;
  });

  const toggleProvider = (provider: string) => {
    setSelectedProviders(prev =>
      prev.includes(provider)
        ? prev.filter(p => p !== provider)
        : [...prev, provider]
    );
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      <FloatingQuoteButton onClick={() => setQuoteModalOpen(true)} />
      <QuoteModal open={quoteModalOpen} onOpenChange={setQuoteModalOpen} />
      
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
              <div className="relative flex-1 w-full md:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar planes de salud..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
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
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{plan.name}</CardTitle>
                        <CardDescription>{plan.empresa}</CardDescription>
                      </div>
                      <div className="flex items-center gap-1 bg-accent px-2 py-1 rounded">
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
                  <Button className="w-full">Ver Detalles</Button>
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
