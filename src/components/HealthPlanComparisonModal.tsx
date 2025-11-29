import { useState, useMemo, useEffect } from "react";
import { X, Plus, Search, Check, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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

interface HealthPlanComparisonModalProps {
  plansToCompare: HealthPlan[];
  allAvailablePlans: HealthPlan[];
  onAddPlan: (planId: string) => void;
  onRemovePlan: (planId: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const HealthPlanComparisonModal = ({
  plansToCompare,
  allAvailablePlans,
  onAddPlan,
  onRemovePlan,
  open,
  onOpenChange,
}: HealthPlanComparisonModalProps) => {
  const [allClinicas, setAllClinicas] = useState<Clinica[]>([]);
  const [loadingClinicas, setLoadingClinicas] = useState(true);
  const [addPlanSearchTerm, setAddPlanSearchTerm] = useState("");
  const [showAddPlanSection, setShowAddPlanSection] = useState(false);

  // Fetch clinicas from endpoint
  useEffect(() => {
    const fetchClinicas = async () => {
      try {
        const response = await fetch('https://servidorplus.avalianonline.com.ar/clinicas');
        const data = await response.json();
        setAllClinicas(data);
      } catch (error) {
        console.error("Error fetching clinicas:", error);
      } finally {
        setLoadingClinicas(false);
      }
    };

    if (open) {
      fetchClinicas();
    }
  }, [open]);

  // Filter clinicas that are in at least one plan
  const relevantClinicas = useMemo(() => {
    if (!allClinicas.length) return [];
    
    return allClinicas.filter(clinica => {
      return plansToCompare.some(plan => 
        plan.clinicas?.some(planClinica => planClinica.item_id === clinica.item_id)
      );
    });
  }, [allClinicas, plansToCompare]);

  // Get unique regions
  const regions = useMemo(() => {
    const regionSet = new Set<string>();
    relevantClinicas.forEach(clinica => {
      if (clinica.ubicacion && clinica.ubicacion[0]?.region) {
        regionSet.add(clinica.ubicacion[0].region);
      }
    });
    return Array.from(regionSet).sort();
  }, [relevantClinicas]);

  // Filter clinicas by region
  const getClinicasByRegion = (region?: string) => {
    if (!region) return relevantClinicas;
    
    return relevantClinicas.filter(clinica => 
      clinica.ubicacion?.[0]?.region === region
    );
  };

  // Check if plan includes clinica
  const planIncludesClinica = (plan: HealthPlan, clinicaId: string) => {
    return plan.clinicas?.some(c => c.item_id === clinicaId) || false;
  };

  // Get unique attribute groups
  const attributeGroups = useMemo(() => {
    if (!plansToCompare.length) return [];
    
    const groups = new Set<string>();
    plansToCompare.forEach(plan => {
      plan.attributes?.forEach(attr => {
        if (attr.attribute_group_name) {
          groups.add(attr.attribute_group_name);
        }
      });
    });
    return Array.from(groups);
  }, [plansToCompare]);

  // Get attributes by group from first plan
  const getAttributesByGroup = (groupName: string) => {
    if (!plansToCompare.length || !plansToCompare[0].attributes) return [];
    
    return plansToCompare[0].attributes.filter(
      attr => attr.attribute_group_name === groupName
    );
  };

  // Get attribute value for a specific plan
  const getAttributeValue = (plan: HealthPlan, attributeName: string, groupName: string) => {
    const attr = plan.attributes?.find(
      a => a.name === attributeName && a.attribute_group_name === groupName
    );
    return attr?.value_name || "-";
  };

  // Plans available to add
  const availablePlansToAdd = useMemo(() => {
    const currentIds = plansToCompare.map(p => p._id);
    return allAvailablePlans
      .filter(plan => !currentIds.includes(plan._id))
      .filter(plan => 
        plan.name.toLowerCase().includes(addPlanSearchTerm.toLowerCase()) ||
        plan.empresa.toLowerCase().includes(addPlanSearchTerm.toLowerCase())
      );
  }, [allAvailablePlans, plansToCompare, addPlanSearchTerm]);

  const PlanHeader = ({ plan }: { plan: HealthPlan }) => (
    <div className="min-w-[200px] border-l border-border px-4 py-3 bg-muted/30 relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-6 w-6 hover:bg-destructive hover:text-destructive-foreground"
        onClick={() => onRemovePlan(plan._id)}
        title="Eliminar plan"
      >
        <X className="h-4 w-4" />
      </Button>
      
      <div className="flex flex-col items-center gap-2 pr-6">
        {plan.images?.[0] && (
          <img
            src={`/${plan.images[0].url}`}
            alt={plan.empresa}
            className="w-16 h-16 object-contain"
          />
        )}
        <div className="text-center">
          <p className="font-semibold text-sm">{plan.name}</p>
          <p className="text-xs text-muted-foreground">{plan.empresa}</p>
          <p className="text-lg font-bold text-primary mt-1">${plan.price}</p>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[90vh] p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">Comparación de Planes</DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddPlanSection(!showAddPlanSection)}
            >
              {showAddPlanSection ? "Ocultar" : "Agregar Plan"}
              <Plus className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* Main comparison content */}
          <div className="flex-1 overflow-hidden">
            <Tabs defaultValue="clinicas" className="flex flex-col h-full">
              <TabsList className="mx-6 mt-4">
                <TabsTrigger value="clinicas">Clínicas</TabsTrigger>
                <TabsTrigger value="beneficios">Beneficios</TabsTrigger>
                <TabsTrigger value="mas-info">Más Información</TabsTrigger>
              </TabsList>

              {/* Clinicas Tab */}
              <TabsContent value="clinicas" className="flex-1 overflow-hidden px-6 pb-6">
                {loadingClinicas ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">Cargando clínicas...</p>
                  </div>
                ) : (
                  <Tabs defaultValue="todas" className="flex flex-col h-full">
                    <TabsList className="w-fit">
                      <TabsTrigger value="todas">Todas</TabsTrigger>
                      {regions.map(region => (
                        <TabsTrigger key={region} value={region}>
                          {region}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    <ScrollArea className="flex-1 mt-4">
                      <TabsContent value="todas" className="m-0">
                        <div className="border rounded-lg overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead className="bg-muted">
                                <tr>
                                  <th className="text-left p-3 font-semibold border-r border-border sticky left-0 bg-muted z-10 min-w-[200px]">
                                    Clínica
                                  </th>
                                  {plansToCompare.map(plan => (
                                    <PlanHeader key={plan._id} plan={plan} />
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {relevantClinicas.map((clinica, idx) => (
                                  <tr 
                                    key={clinica.item_id}
                                    className={idx % 2 === 0 ? "bg-background" : "bg-muted/20"}
                                  >
                                    <td className="p-3 border-r border-border sticky left-0 bg-inherit z-10 min-w-[200px]">
                                      <div>
                                        <p className="font-medium text-sm">{clinica.entity}</p>
                                        {clinica.ubicacion?.[0] && (
                                          <p className="text-xs text-muted-foreground">
                                            {clinica.ubicacion[0].barrio} - {clinica.ubicacion[0].region}
                                          </p>
                                        )}
                                      </div>
                                    </td>
                                    {plansToCompare.map(plan => (
                                      <td 
                                        key={`${plan._id}-${clinica.item_id}`}
                                        className="p-3 text-center border-l border-border"
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
                      </TabsContent>

                      {regions.map(region => (
                        <TabsContent key={region} value={region} className="m-0">
                          <div className="border rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead className="bg-muted">
                                  <tr>
                                    <th className="text-left p-3 font-semibold border-r border-border sticky left-0 bg-muted z-10 min-w-[200px]">
                                      Clínica
                                    </th>
                                    {plansToCompare.map(plan => (
                                      <PlanHeader key={plan._id} plan={plan} />
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {getClinicasByRegion(region).map((clinica, idx) => (
                                    <tr 
                                      key={clinica.item_id}
                                      className={idx % 2 === 0 ? "bg-background" : "bg-muted/20"}
                                    >
                                      <td className="p-3 border-r border-border sticky left-0 bg-inherit z-10 min-w-[200px]">
                                        <div>
                                          <p className="font-medium text-sm">{clinica.entity}</p>
                                          {clinica.ubicacion?.[0] && (
                                            <p className="text-xs text-muted-foreground">
                                              {clinica.ubicacion[0].barrio}
                                            </p>
                                          )}
                                        </div>
                                      </td>
                                      {plansToCompare.map(plan => (
                                        <td 
                                          key={`${plan._id}-${clinica.item_id}`}
                                          className="p-3 text-center border-l border-border"
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
                        </TabsContent>
                      ))}
                    </ScrollArea>
                  </Tabs>
                )}
              </TabsContent>

              {/* Beneficios Tab */}
              <TabsContent value="beneficios" className="flex-1 overflow-hidden px-6 pb-6">
                <ScrollArea className="h-full">
                  <div className="space-y-6">
                    {attributeGroups.map(groupName => {
                      const attributes = getAttributesByGroup(groupName);
                      if (!attributes.length) return null;

                      return (
                        <div key={groupName} className="border rounded-lg overflow-hidden">
                          <div className="bg-muted px-4 py-2">
                            <h3 className="font-semibold">{groupName}</h3>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead className="bg-muted/50">
                                <tr>
                                  <th className="text-left p-3 font-medium border-r border-border sticky left-0 bg-muted/50 z-10 min-w-[200px]">
                                    Beneficio
                                  </th>
                                  {plansToCompare.map(plan => (
                                    <PlanHeader key={plan._id} plan={plan} />
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {attributes.map((attr, idx) => (
                                  <tr 
                                    key={`${groupName}-${attr.name}-${idx}`}
                                    className={idx % 2 === 0 ? "bg-background" : "bg-muted/20"}
                                  >
                                    <td className="p-3 font-medium text-sm border-r border-border sticky left-0 bg-inherit z-10 min-w-[200px]">
                                      {attr.name}
                                    </td>
                                    {plansToCompare.map(plan => (
                                      <td 
                                        key={`${plan._id}-${attr.name}`}
                                        className="p-3 text-center text-sm border-l border-border"
                                      >
                                        {getAttributeValue(plan, attr.name, groupName)}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Más Información Tab */}
              <TabsContent value="mas-info" className="flex-1 overflow-hidden px-6 pb-6">
                <ScrollArea className="h-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {plansToCompare.map(plan => (
                      <Card key={plan._id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {plan.images?.[0] && (
                                <img
                                  src={`/${plan.images[0].url}`}
                                  alt={plan.empresa}
                                  className="w-12 h-12 object-contain"
                                />
                              )}
                              <div>
                                <CardTitle className="text-lg">{plan.name}</CardTitle>
                                <CardDescription>{plan.empresa}</CardDescription>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Línea:</span>
                              <Badge variant="secondary">{plan.linea}</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Rating:</span>
                              <span className="font-medium">⭐ {plan.rating}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Precio mensual:</span>
                              <span className="text-xl font-bold text-primary">${plan.price}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>

          {/* Add Plan Sidebar */}
          {showAddPlanSection && (
            <div className="w-full lg:w-80 border-l border-border bg-muted/30 flex flex-col">
              <div className="p-4 border-b">
                <h3 className="font-semibold mb-3">Agregar Plan</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar planes..."
                    value={addPlanSearchTerm}
                    onChange={(e) => setAddPlanSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-2">
                  {availablePlansToAdd.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      {addPlanSearchTerm 
                        ? "No se encontraron planes" 
                        : "No hay más planes disponibles"}
                    </p>
                  ) : (
                    availablePlansToAdd.map(plan => (
                      <Card key={plan._id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="p-3">
                          <div className="flex items-center gap-2">
                            {plan.images?.[0] && (
                              <img
                                src={`/${plan.images[0].url}`}
                                alt={plan.empresa}
                                className="w-8 h-8 object-contain flex-shrink-0"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{plan.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{plan.empresa}</p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-3 pt-0">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-lg font-bold text-primary">${plan.price}</p>
                              <p className="text-xs text-muted-foreground">por mes</p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => {
                                onAddPlan(plan._id);
                                setAddPlanSearchTerm("");
                              }}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Agregar
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
