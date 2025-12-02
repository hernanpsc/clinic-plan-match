import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Grid3x3, Plus } from "lucide-react";
import { getHealthPlans, type HealthPlan, type Clinica } from "@/services/health.service";
import { Helmet } from "react-helmet-async";
import Layout from "@/layouts/Layout";
import FormQuote from "@/modules/salud/components/FormQuote";
import { FloatingQuoteButton } from "@/modules/salud/components/FloatingQuoteButton";
import { ComparisonBar } from "@/modules/salud/components/ComparisonBar";
import { ResultsFilterSidebar } from "@/modules/salud/components/ResultsFilterSidebar";
import { ResultsHeaderBar } from "@/modules/salud/components/ResultsHeaderBar";
import { ResultsGrid } from "@/modules/salud/components/ResultsGrid";
import { PlanDetailsModal } from "@/modules/salud/components/PlanDetailsModal";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

// Interfaces are now imported from health.service.ts

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
  const [sortBy, setSortBy] = useState<string>("default");
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<HealthPlan | null>(null);

  const [selectedClinicas, setSelectedClinicas] = useState<Clinica[]>([]);
  const [openClinicSearch, setOpenClinicSearch] = useState(false);
  const [comparisonPlans, setComparisonPlans] = useState<string[]>([]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await getHealthPlans();
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

  // Sort filtered plans
  const sortedPlans = [...filteredPlans].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "name-asc":
        return a.empresa.localeCompare(b.empresa);
      default:
        return 0;
    }
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

  const openDetailsModal = (plan: HealthPlan) => {
    setSelectedPlan(plan);
    setDetailsModalOpen(true);
  };

  const clearFilters = () => {
    setPriceRange([0, 600]);
    setSelectedProviders([]);
    setMinRating([0]);
    setSelectedClinicas([]);
  };

  return (
    <Layout>
      <Helmet>
        <title>Planes de Salud Disponibles | Comparador de Prepagas Argentina</title>
        <meta name="description" content={`Explorá ${healthPlans.length} planes de salud de las mejores prepagas de Argentina. Filtrá por precio, cobertura y clínicas. Compará y elegí el mejor plan para vos.`} />
        <meta name="keywords" content="planes de salud precios, prepagas argentina, comparar planes médicos, cobertura médica, clínicas prepagas" />
        <link rel="canonical" href="https://tudominio.com/resultados" />
        <meta property="og:title" content="Planes de Salud Disponibles - Comparador de Prepagas" />
        <meta property="og:description" content="Encontrá y compará los mejores planes de salud de Argentina con filtros por precio y cobertura." />
        <meta property="og:url" content="https://tudominio.com/resultados" />
      </Helmet>
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
            Usá los filtros para encontrar el plan ideal para vos y tu familia
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-[320px_1fr] gap-6">
          {/* Sidebar de Filtros - Desktop */}
          <aside className="hidden lg:block bg-card border border-border rounded-xl p-6 h-fit lg:sticky lg:top-6 shadow-sm">
            <ResultsFilterSidebar
              priceRange={priceRange}
              onPriceRangeChange={setPriceRange}
              providers={providers}
              selectedProviders={selectedProviders}
              onToggleProvider={toggleProvider}
              minRating={minRating}
              onMinRatingChange={setMinRating}
              onClearFilters={clearFilters}
            />
          </aside>

          {/* Mobile Filter Drawer */}
          <Sheet open={filterDrawerOpen} onOpenChange={setFilterDrawerOpen}>
            <SheetContent side="left" className="w-[80%] sm:w-[350px]">
              <SheetHeader>
                <SheetTitle>Filtros</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <ResultsFilterSidebar
                  priceRange={priceRange}
                  onPriceRangeChange={setPriceRange}
                  providers={providers}
                  selectedProviders={selectedProviders}
                  onToggleProvider={toggleProvider}
                  minRating={minRating}
                  onMinRatingChange={setMinRating}
                  onClearFilters={clearFilters}
                />
              </div>
            </SheetContent>
          </Sheet>

          {/* Contenido Principal */}
          <main className="flex-1 space-y-6">
            <ResultsHeaderBar
              sortBy={sortBy}
              onSortChange={setSortBy}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              filteredPlansCount={filteredPlans.length}
              onOpenFilters={() => setFilterDrawerOpen(true)}
              allClinicas={allClinicas}
              selectedClinicas={selectedClinicas}
              onToggleClinica={toggleClinica}
              onRemoveClinica={removeClinica}
              openClinicSearch={openClinicSearch}
              onOpenClinicSearchChange={setOpenClinicSearch}
            />

            <ResultsGrid
              plans={sortedPlans}
              loading={loading}
              viewMode={viewMode}
              comparisonPlans={comparisonPlans}
              onToggleComparison={toggleComparison}
              onOpenDetails={openDetailsModal}
            />
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

      <PlanDetailsModal
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
        plan={selectedPlan}
        isInComparison={selectedPlan ? comparisonPlans.includes(selectedPlan._id) : false}
        onToggleComparison={toggleComparison}
        onRequestQuote={() => setFormQuoteOpen(true)}
      />
    </Layout>
  );
};

export default ResultadosPage;
