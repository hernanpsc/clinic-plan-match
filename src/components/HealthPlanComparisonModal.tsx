import React, { useState, useMemo, useEffect, useCallback } from "react";
import { X, Plus, Search, Check, Trash2, Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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

interface HealthPlanComparisonModalProps {
  plansToCompare: HealthPlan[];
  allAvailablePlans: HealthPlan[];
  onAddPlan: (planId: string) => void;
  onRemovePlan: (planId: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// --- CONSTANTS ---
const ATTRIBUTE_GROUPS = [
  "Cobertura Ambulatoria",
  "Internación y Cirugías",
  "Odontología y Óptica",
  "Reintegros y Servicios"
];

// Estilos para la tabla sticky
const ComparisonStyles = `
  .comparison-container {
    max-height: calc(90vh - 120px); 
    overflow: auto;
  }
  .sticky-col {
    position: sticky;
    left: 0;
    z-index: 10;
    background-color: inherit;
    box-shadow: 2px 0 5px rgba(0,0,0,0.05);
  }
  .sticky-header th {
    position: sticky;
    top: 0;
    z-index: 20;
    background-color: hsl(var(--background));
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    padding: 0; 
  }
  .corner-cell {
    z-index: 30 !important;
    background-color: hsl(var(--muted)) !important;
  }
  .sticky-group-header {
    position: sticky;
    left: 0;
    z-index: 10;
    background-color: hsl(var(--muted)) !important;
    box-shadow: 2px 0 5px rgba(0,0,0,0.05);
  }
`;

// --- COMPONENTS ---
const PlanHeader = React.memo(({ plan, onRemovePlan }: { plan: HealthPlan; onRemovePlan: (planId: string) => void }) => (
  <div className="flex flex-col items-center justify-center p-3 h-full border-b border-border bg-muted/30">
    <div className="text-lg font-extrabold text-primary truncate max-w-full">{plan.name}</div>
    <div className="text-xs text-muted-foreground">{plan.empresa}</div>
    <div className="text-base font-bold text-green-600 mt-1">${plan.price}</div>
    <div className="flex items-center text-yellow-500 text-sm mt-0.5">
      <Star className="w-3 h-3 fill-yellow-500" />
      <span className="ml-1">{plan.rating}/5</span>
    </div>
    <Button 
      variant="destructive" 
      size="sm"
      onClick={() => onRemovePlan(plan._id)}
      className="mt-2 h-6 px-2 text-xs"
    >
      <Trash2 className="w-3 h-3 mr-1" /> Remover
    </Button>
  </div>
));

PlanHeader.displayName = "PlanHeader";

// --- MAIN COMPONENT ---
export const HealthPlanComparisonModal = ({
  plansToCompare,
  allAvailablePlans,
  onAddPlan,
  onRemovePlan,
  open,
  onOpenChange,
}: HealthPlanComparisonModalProps) => {
  const [activeTab, setActiveTab] = useState("beneficios"); 
  const [activeClinicaTab, setActiveClinicaTab] = useState("todas"); 
  const [searchTerm, setSearchTerm] = useState("");
  
  useEffect(() => {
    if (!open) {
      setSearchTerm("");
      setActiveTab("beneficios");
      setActiveClinicaTab("todas");
    }
  }, [open]);

  // --- DATA LOGIC ---
  const plansToAdd = useMemo(() => {
    const comparingIds = new Set(plansToCompare.map(p => p._id));
    return allAvailablePlans
      .filter(plan => !comparingIds.has(plan._id))
      .filter(plan => 
        plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.linea.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.empresa.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [allAvailablePlans, plansToCompare, searchTerm]);
  
  const groupedAttributes = useMemo(() => {
    const uniqueAttributeNames: Record<string, Set<string>> = {};
    
    plansToCompare.forEach(plan => {
      plan.attributes?.forEach(attr => {
        const groupName = attr.attribute_group_name && ATTRIBUTE_GROUPS.includes(attr.attribute_group_name) 
                          ? attr.attribute_group_name 
                          : 'Otros Beneficios';

        if (!uniqueAttributeNames[groupName]) {
          uniqueAttributeNames[groupName] = new Set();
        }
        uniqueAttributeNames[groupName].add(attr.name);
      });
    });

    const finalGroups: Record<string, string[]> = {};
    const sortedGroupKeys = [...ATTRIBUTE_GROUPS, 'Otros Beneficios'].filter(key => uniqueAttributeNames[key]);

    for (const groupName of sortedGroupKeys) {
      if (uniqueAttributeNames[groupName]) {
        finalGroups[groupName] = Array.from(uniqueAttributeNames[groupName]);
      }
    }

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
    return Array.from(clinicaMap.values()).sort((a, b) => a.entity.localeCompare(b.entity));
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
        
        <ScrollArea className="comparison-container w-full h-full max-h-[75vh]">
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
            <tbody className="bg-background divide-y divide-border">
              {Object.entries(groupedAttributes).map(([groupName, attrNames]) => (
                <React.Fragment key={groupName}>
                  <tr className="bg-muted/50">
                    <th colSpan={plansToCompare.length + 1} className="p-0">
                      <div className="px-4 py-2 font-bold text-primary text-left sticky-group-header border-b border-border">
                        {groupName}
                      </div>
                    </th>
                  </tr>
                  
                  {attrNames.map((attrName, index) => (
                    <tr key={attrName} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
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
        </ScrollArea>
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
      <div className="border rounded-lg overflow-hidden flex-1">
        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed divide-y divide-border">
            <thead className="bg-muted sticky top-0 z-20">
              <tr>
                <th className="text-left p-3 font-semibold border-r border-border sticky left-0 bg-muted z-10 min-w-[250px] corner-cell">
                  Clínica
                </th>
                {plansToCompare.map(plan => (
                  <th 
                    key={plan._id} 
                    className="p-3 text-center font-bold text-sm border-l border-border min-w-[250px]"
                  >
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clinicas.map((clinica, idx) => (
                <tr 
                  key={clinica.item_id}
                  className={idx % 2 === 0 ? "bg-background" : "bg-muted/20"}
                >
                  <th scope="row" className="p-3 border-r border-border sticky left-0 bg-inherit z-10 min-w-[250px] text-left">
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
    );
  };

  const renderClinicasContent = () => {
    const clinicasToShow = activeClinicaTab === "todas" 
      ? uniqueClinicas 
      : getClinicasByRegion(activeClinicaTab);

    return (
      <div className="flex flex-col h-full overflow-hidden">
        <style dangerouslySetInnerHTML={{ __html: ComparisonStyles }} />
        
        <div className="w-full overflow-x-auto border-b border-border bg-background shadow-sm sticky top-0 z-40">
          <table className="min-w-full table-fixed">
            <thead>
              <tr>
                <th className="w-48 px-4 py-3 sticky left-0 bg-background z-10 min-w-[250px] border-r border-border">
                  {/* Espacio para alinear */}
                </th>
                {plansToCompare.map(plan => (
                  <th key={plan._id} className="min-w-[250px] border-l border-border p-0">
                    <PlanHeader plan={plan} onRemovePlan={onRemovePlan} />
                  </th>
                ))}
              </tr>
            </thead>
          </table>
        </div>
        
        <Tabs 
          defaultValue="todas" 
          value={activeClinicaTab} 
          onValueChange={setActiveClinicaTab} 
          className="flex flex-col flex-1 mt-0 h-full overflow-hidden"
        >
          <div className="px-4 pt-4 border-b bg-background z-30">
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
          
          <ScrollArea className="flex-1 overflow-y-auto w-full h-full p-4 pt-0">
            <TabsContent value={activeClinicaTab} className="p-0 pt-4 mt-0">
              {renderClinicasTable(clinicasToShow)} 
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>
    );
  };

  const renderAddPlanTab = () => (
    <div className="flex flex-col space-y-4 h-full">
      <div className="relative">
        <Input 
          placeholder="Buscar planes por nombre o línea..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
      </div>

      <ScrollArea className="flex-grow h-full max-h-[500px]">
        {plansToAdd.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No se encontraron planes disponibles o ya están todos comparados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Comparación de Planes de Salud</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-full overflow-hidden">
          <Tabs defaultValue="beneficios" value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
            <div className="px-6">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="beneficios">
                  Beneficios
                </TabsTrigger>
                <TabsTrigger value="clinicas">
                  Clínicas y Red
                </TabsTrigger>
                <TabsTrigger value="add">
                  Añadir Plan
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-grow overflow-hidden">
              <TabsContent value="beneficios" className="h-full p-0 mt-0">
                {renderBeneficiosTable()}
              </TabsContent>

              <TabsContent value="clinicas" className="h-full p-0 mt-0">
                {renderClinicasContent()}
              </TabsContent>

              <TabsContent value="add" className="h-full p-6 mt-0">
                {renderAddPlanTab()}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
