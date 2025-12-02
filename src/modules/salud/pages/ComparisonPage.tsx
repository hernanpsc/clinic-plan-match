import React, { useState, useMemo, useEffect, useCallback } from "react";
import { X, Plus, Search, Check, Trash2, Star, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Layout from "@/layouts/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

// --- INTERFACES ---
interface Ubicacion {
  direccion: string;
  telefono: string;
  barrio: string;
  partido: string;
  region: string;
  provincia: string;
  CP: string;
}

interface Clinica {
  item_id: string;
  nombre: string;
  entity: string;
  ubicacion?: Ubicacion[];
}

interface Attribute {
  name: string;
  value_name: string;
  attribute_group_name: string;
  attribute_name_order?: number | null;
  attribute_group_order?: number | null;
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
}

interface ComparisonPageProps {
  plansToCompare?: HealthPlan[];
  allAvailablePlans?: HealthPlan[];
  onAddPlan?: (planId: string) => void;
  onRemovePlan?: (planId: string) => void;
}

// --- CONSTANTS ---
const ATTRIBUTE_GROUPS = [
  "Cobertura Ambulatoria",
  "Internación y Cirugías",
  "Odontología y Óptica",
  "Reintegros y Servicios"
];

// Estilos para la tabla sticky con scroll horizontal
const ComparisonStyles = `
  .comparison-scroll-container {
    overflow-x: auto;
    overflow-y: hidden;
    width: 100%;
  }
  .comparison-table-wrapper {
    overflow-y: auto;
    max-height: calc(90vh - 200px);
  }
  .sticky-col {
    position: sticky;
    left: 0;
    z-index: 15;
    background-color: hsl(var(--background));
    box-shadow: 2px 0 8px rgba(0,0,0,0.1);
  }
  .sticky-header th {
    position: sticky;
    top: 0;
    z-index: 20;
    background-color: hsl(var(--background));
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    padding: 0; 
  }
  .corner-cell {
    z-index: 25 !important;
    background-color: hsl(var(--muted)) !important;
  }
`;

// --- COMPONENTS ---
const PlanHeader = React.memo(({ plan, onRemovePlan }: { plan: HealthPlan; onRemovePlan: (planId: string) => void }) => (
  <div className="relative flex flex-col items-center justify-center p-3 h-full border-b border-border bg-muted/30">
    <Button 
      variant="ghost" 
      size="icon"
      onClick={() => onRemovePlan(plan._id)}
      className="absolute top-2 right-2 h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
    >
      <Trash2 className="w-4 h-4" />
    </Button>
    <div className="flex items-center gap-2 mb-1">
      <div className="text-lg font-extrabold text-primary truncate max-w-full">{plan.name}</div>
      <div className="flex items-center text-yellow-500 text-sm shrink-0">
        <Star className="w-4 h-4 fill-yellow-500" />
        <span className="ml-1">{plan.rating}</span>
      </div>
    </div>
    <div className="text-xs text-muted-foreground">{plan.empresa}</div>
    <div className="text-base font-bold text-green-600 mt-1">${plan.price}</div>
  </div>
));

PlanHeader.displayName = "PlanHeader";

// --- MAIN COMPONENT ---
export const ComparisonPage = ({
  plansToCompare: propPlansToCompare,
  allAvailablePlans: propAllAvailablePlans,
  onAddPlan: propOnAddPlan,
  onRemovePlan: propOnRemovePlan,
}: ComparisonPageProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("beneficios"); 
  const [activeClinicaTab, setActiveClinicaTab] = useState("todas"); 
  const [searchTerm, setSearchTerm] = useState("");
  
  // Internal state management
  const [internalPlansToCompare, setInternalPlansToCompare] = useState<HealthPlan[]>([]);
  const [internalAllPlans, setInternalAllPlans] = useState<HealthPlan[]>([]);
  
  // Use props if provided, otherwise use internal state from sessionStorage
  const plansToCompare = (propPlansToCompare && propPlansToCompare.length > 0) ? propPlansToCompare : internalPlansToCompare;
  const allAvailablePlans = (propAllAvailablePlans && propAllAvailablePlans.length > 0) ? propAllAvailablePlans : internalAllPlans;
  
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    // Load data from sessionStorage if not provided via props
    if (!propPlansToCompare || !propAllAvailablePlans) {
      const storedComparisonPlans = sessionStorage.getItem('comparisonPlans');
      const storedAllPlans = sessionStorage.getItem('allPlans');
      
      console.log('Loading from sessionStorage:', { storedComparisonPlans, storedAllPlans });
      
      if (storedComparisonPlans && storedAllPlans) {
        try {
          const parsedComparisonPlans = JSON.parse(storedComparisonPlans);
          const parsedAllPlans = JSON.parse(storedAllPlans);
          console.log('Parsed data:', { parsedComparisonPlans, parsedAllPlans });
          setInternalPlansToCompare(parsedComparisonPlans);
          setInternalAllPlans(parsedAllPlans);
        } catch (error) {
          console.error('Error parsing sessionStorage:', error);
          toast({
            title: "Error",
            description: "No se pudieron cargar los planes de comparación",
            variant: "destructive"
          });
          navigate('/');
        }
      } else {
        console.log('No data in sessionStorage, redirecting to home');
        navigate('/');
      }
    }
  }, [propPlansToCompare, propAllAvailablePlans, navigate, toast]);
  
  const handleAddPlan = (planId: string) => {
    if (propOnAddPlan) {
      propOnAddPlan(planId);
    } else {
      if (internalPlansToCompare.length < 4) {
        const planToAdd = internalAllPlans.find(p => p._id === planId);
        if (planToAdd && !internalPlansToCompare.find(p => p._id === planId)) {
          const newPlans = [...internalPlansToCompare, planToAdd];
          setInternalPlansToCompare(newPlans);
          sessionStorage.setItem('comparisonPlans', JSON.stringify(newPlans));
        }
      }
    }
  };
  
  const handleRemovePlan = (planId: string) => {
    if (propOnRemovePlan) {
      propOnRemovePlan(planId);
    } else {
      const newPlans = internalPlansToCompare.filter(p => p._id !== planId);
      setInternalPlansToCompare(newPlans);
      sessionStorage.setItem('comparisonPlans', JSON.stringify(newPlans));
    }
  };
  
  const onAddPlan = propOnAddPlan || handleAddPlan;
  const onRemovePlan = propOnRemovePlan || handleRemovePlan;
  
  // --- DATA LOGIC ---
  const plansToAdd = useMemo(() => {
    const comparingIds = new Set(plansToCompare.map(p => p._id));
    return allAvailablePlans
      .filter(plan => !comparingIds.has(plan._id))
      .filter(plan => {
        const searchLower = searchTerm.toLowerCase();
        return (
          (plan.name?.toLowerCase() || '').includes(searchLower) ||
          (plan.linea?.toLowerCase() || '').includes(searchLower) ||
          (plan.empresa?.toLowerCase() || '').includes(searchLower)
        );
      });
  }, [allAvailablePlans, plansToCompare, searchTerm]);
  
  const groupedAttributes = useMemo(() => {
    const uniqueAttrs = new Map<string, {
      groupName: string;
      groupOrder: number | null;
      attrName: string;
      attrOrder: number | null;
    }>();
    
    plansToCompare.forEach(plan => {
      plan.attributes?.forEach(attr => {
        const groupName = attr.attribute_group_name || 'Otros Beneficios';
        const key = `${groupName}::${attr.name}`;
        
        if (!uniqueAttrs.has(key)) {
          uniqueAttrs.set(key, {
            groupName,
            groupOrder: attr.attribute_group_order ?? null,
            attrName: attr.name,
            attrOrder: attr.attribute_name_order ?? null
          });
        }
      });
    });

    const sortedAttrs = Array.from(uniqueAttrs.values()).sort((a, b) => {
      if (a.groupOrder != null && b.groupOrder != null) {
        if (a.groupOrder !== b.groupOrder) return a.groupOrder - b.groupOrder;
      } else if (a.groupOrder != null) return -1;
      else if (b.groupOrder != null) return 1;
      else if (a.groupName !== b.groupName) {
        return a.groupName.localeCompare(b.groupName);
      }
      
      if (a.attrOrder != null && b.attrOrder != null) {
        return a.attrOrder - b.attrOrder;
      } else if (a.attrOrder != null) return -1;
      else if (b.attrOrder != null) return 1;
      return a.attrName.localeCompare(b.attrName);
    });

    const finalGroups: Record<string, string[]> = {};
    sortedAttrs.forEach(attr => {
      if (!finalGroups[attr.groupName]) {
        finalGroups[attr.groupName] = [];
      }
      finalGroups[attr.groupName].push(attr.attrName);
    });

    return finalGroups;
  }, [plansToCompare]);

  const getPlanAttributeValue = useCallback((plan: HealthPlan, attrName: string): string => {
    const attr = plan.attributes?.find(a => a.name === attrName);
    return attr ? attr.value_name : 'N/A';
  }, []);
  
  const uniqueClinicas = useMemo(() => {
    const clinicaMap = new Map<string, Clinica>();
    plansToCompare.forEach(plan => {
      plan.clinicas?.forEach(clinica => {
        if (!clinicaMap.has(clinica.item_id)) {
          clinicaMap.set(clinica.item_id, clinica);
        }
      });
    });
    return Array.from(clinicaMap.values()).sort((a, b) => (a.entity || '').localeCompare(b.entity || ''));
  }, [plansToCompare]);
  
  const regions = useMemo(() => {
    const regionSet = new Set<string>();
    uniqueClinicas.forEach(clinica => {
      clinica.ubicacion?.forEach(ub => {
        if (ub.region) {
          regionSet.add(ub.region);
        }
      });
    });
    return Array.from(regionSet).sort();
  }, [uniqueClinicas]);

  const getClinicasByRegion = useCallback((region: string): Clinica[] => {
    return uniqueClinicas.filter(clinica => 
      clinica.ubicacion?.some(ub => ub.region === region)
    );
  }, [uniqueClinicas]);

  const planIncludesClinica = useCallback((plan: HealthPlan, clinicaId: string): boolean => {
    return plan.clinicas?.some(clinica => clinica.item_id === clinicaId) ?? false;
  }, []);
  
  // --- RENDER FUNCTIONS ---
  const renderBeneficiosTable = () => {
    if (plansToCompare.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full py-16 text-center text-muted-foreground">
          <Search className="w-10 h-10 mb-4" />
          <p className="text-lg font-medium">No hay planes seleccionados para comparar beneficios.</p>
        </div>
      );
    }
    
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <style dangerouslySetInnerHTML={{ __html: ComparisonStyles }} />
        
        <div className="comparison-scroll-container">
          <div className="comparison-table-wrapper">
            <table className="min-w-full table-fixed divide-y divide-border">
              <thead className="sticky-header">
                <tr>
                  <th scope="col" className="w-48 px-4 py-3 sticky-col corner-cell text-left text-xs font-semibold uppercase">
                    Beneficio / Atributo
                  </th>
                  {plansToCompare.map(plan => (
                    <th key={plan._id} scope="col" className="min-w-[250px] border-l border-border">
                      <PlanHeader plan={plan} onRemovePlan={onRemovePlan} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-background">
                {Object.entries(groupedAttributes).map(([groupName, attrNames]) => (
                  <React.Fragment key={groupName}>
                    <tr className="bg-primary/10 border-t-2 border-t-primary">
                      <td 
                        colSpan={plansToCompare.length + 1} 
                        className="px-6 py-4 font-bold text-lg text-primary text-center uppercase tracking-wide"
                      >
                        {groupName}
                      </td>
                    </tr>
                    
                    {attrNames.map((attrName, index) => (
                      <tr key={attrName} className={index % 2 === 0 ? 'bg-background border-b border-border' : 'bg-muted/20 border-b border-border'}>
                        <th scope="row" className="px-4 py-3 font-medium sticky-col text-left text-sm">
                          {attrName}
                        </th>
                        {plansToCompare.map(plan => {
                          const value = getPlanAttributeValue(plan, attrName);
                          return (
                            <td key={`${plan._id}-${attrName}`} className="w-64 px-4 py-3 text-center border-l border-border">
                              <Badge variant={value === 'N/A' || value === 'No' ? 'secondary' : 'default'}>
                                {value}
                              </Badge>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderClinicasTable = (clinicas: Clinica[]) => {
    if (plansToCompare.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full py-16 text-center text-muted-foreground">
          <Search className="w-10 h-10 mb-4" />
          <p className="text-lg font-medium">No hay planes seleccionados para comparar cartillas.</p>
        </div>
      );
    }
      
    if (clinicas.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <p>No se encontraron clínicas para esta selección.</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full overflow-hidden">
        <div className="comparison-scroll-container">
          <div className="comparison-table-wrapper">
            <table className="min-w-full table-fixed divide-y divide-border">
              <thead className="sticky-header">
                <tr>
                  <th scope="col" className="w-[400px] px-4 py-3 sticky-col corner-cell text-left text-xs font-semibold uppercase">
                    Clínica
                  </th>
                  {plansToCompare.map(plan => (
                    <th key={plan._id} scope="col" className="w-[150px] border-l border-border">
                      <PlanHeader plan={plan} onRemovePlan={onRemovePlan} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-background">
                {clinicas.map((clinica, idx) => (
                  <tr 
                    key={clinica.item_id}
                    className={idx % 2 === 0 ? "bg-background border-b border-border" : "bg-muted/20 border-b border-border"}
                  >
                    <th scope="row" className="px-4 py-3 sticky-col text-left">
                      <div>
                        <p className="font-medium text-sm">{clinica.entity}</p>
                        {clinica.ubicacion?.[0] && (
                          <p className="text-xs text-muted-foreground">
                            {clinica.ubicacion[0].barrio} - {clinica.ubicacion[0].region}
                          </p>
                        )}
                      </div>
                    </th>
                    {plansToCompare.map(plan => (
                      <td 
                        key={`${plan._id}-${clinica.item_id}`}
                        className="px-4 py-3 text-center border-l border-border"
                      >
                        {planIncludesClinica(plan, clinica.item_id) ? (
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-red-600 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderClinicasContent = () => {
    const clinicasToShow = activeClinicaTab === "todas" 
      ? uniqueClinicas 
      : getClinicasByRegion(activeClinicaTab);

    return (
      <div className="flex flex-col h-full overflow-hidden">
        <style dangerouslySetInnerHTML={{ __html: ComparisonStyles }} />
        
        <div className="w-full overflow-x-auto border-b border-border bg-background shadow-sm shrink-0 z-40">
          <table className="min-w-full table-fixed">
  
          </table>
        </div>
        
        <Tabs 
          defaultValue="todas" 
          value={activeClinicaTab} 
          onValueChange={setActiveClinicaTab} 
          className="flex flex-col flex-1 min-h-0"
        >
          <div className="px-4 pt-4 border-b bg-background shrink-0">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="todas">
                Todas ({uniqueClinicas.length})
              </TabsTrigger>
              {regions.map(region => (
                <TabsTrigger key={region} value={region}>
                  {region} ({getClinicasByRegion(region).length})
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          
          <ScrollArea className="flex-1 min-h-0 w-full">
            <TabsContent value={activeClinicaTab} className="p-4 m-0">
              {renderClinicasTable(clinicasToShow)} 
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>
    );
  };

  const renderAddPlanTab = () => (
    <div className="flex flex-col space-y-4 h-full overflow-hidden">
      <div className="relative shrink-0">
        <Input 
          placeholder="Buscar planes por nombre o línea..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
      </div>

      <ScrollArea className="flex-1 min-h-0">
        {plansToAdd.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No se encontraron planes disponibles o ya están todos comparados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-4">
            {plansToAdd.map(plan => (
              <Card key={plan._id}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-start text-base">
                    {plan.name}
                    <Badge variant="secondary">{plan.linea}</Badge>
                  </CardTitle>
                  <CardDescription className="text-base font-semibold text-green-600">${plan.price}</CardDescription>
                  <CardDescription>{plan.empresa}</CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <ul className="text-xs text-muted-foreground space-y-1 mb-3">
                    <li><Check className="w-3 h-3 inline mr-1 text-green-500" /> Cobertura Ambulatoria Básica</li>
                    <li><Check className="w-3 h-3 inline mr-1 text-green-500" /> {plan.clinicas?.length || 0} Clínicas en Cartilla</li>
                  </ul>
                  <Button 
                    onClick={() => onAddPlan(plan._id)} 
                    className="w-full"
                    disabled={plansToCompare.length >= 4}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Añadir a Comparación
                  </Button>
                  {plansToCompare.length >= 4 && (
                    <p className="text-xs text-center text-destructive mt-2">Máximo 4 planes</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );

  return (
    <Layout>
      <Helmet>
        <title>{`Comparar Planes de Salud | ${plansToCompare.length} Planes Seleccionados`}</title>
        <meta name="description" content={`Compará lado a lado ${plansToCompare.length} planes de salud. Analizá beneficios, coberturas, cartilla médica y precios para tomar la mejor decisión.`} />
        <meta name="keywords" content="comparar planes de salud, comparador prepagas, beneficios planes médicos, cartilla médica" />
        <link rel="canonical" href="https://tudominio.com/comparar" />
        <meta property="og:title" content={`Comparación de ${plansToCompare.length} Planes de Salud`} />
        <meta property="og:description" content="Compará beneficios, coberturas y clínicas de múltiples planes de salud en una sola vista." />
        <meta property="og:url" content="https://tudominio.com/comparar" />
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-primary/5 via-background to-secondary/20 border-b border-border">
        <div className="container mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/resultados')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a resultados
            </Button>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
              Comparación de Planes
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Compará en detalle los beneficios, cartilla médica y coberturas de cada plan
            </p>
            <div className="flex gap-3">
              <Badge variant="secondary">{plansToCompare.length} planes seleccionados</Badge>
              <Badge variant="outline">Máximo 4 planes</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-background">
        <div className="container mx-auto max-w-7xl px-6 py-8">
          <Tabs defaultValue="beneficios" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="w-full justify-start bg-muted/30 p-1 rounded-xl h-14">
              <TabsTrigger value="beneficios" className="rounded-lg text-base px-6 py-3">
                Beneficios
              </TabsTrigger>
              <TabsTrigger value="clinicas" className="rounded-lg text-base px-6 py-3">
                Clínicas y Red
              </TabsTrigger>
              <TabsTrigger value="add" className="rounded-lg flex items-center gap-2 text-base px-6 py-3">
                <Plus className="w-5 h-5" />
                Añadir Plan
              </TabsTrigger>
            </TabsList>

            <TabsContent value="beneficios" className="mt-0 bg-card border border-border rounded-xl shadow-sm overflow-hidden">
              <div className="max-h-[600px] overflow-auto">
                {renderBeneficiosTable()}
              </div>
            </TabsContent>

            <TabsContent value="clinicas" className="mt-0 bg-card border border-border rounded-xl shadow-sm overflow-hidden">
              <div className="max-h-[600px] overflow-auto">
                {renderClinicasContent()}
              </div>
            </TabsContent>

            <TabsContent value="add" className="mt-0">
              {renderAddPlanTab()}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default ComparisonPage;
