import React, { useState, useMemo, useEffect, useCallback } from "react";
import { X, Plus, Search, Check, Trash2, ChevronDown, MapPin, Star } from "lucide-react";

// NOTA IMPORTANTE: Para que este código sea runnable en un entorno sin las librerías originales,
// utilizaremos componentes simples de React/Tailwind que replican la estructura y funcionalidad
// de los componentes asumidos de 'shadcn/ui' (Dialog, Tabs, Button, Input, etc.).

// --- MOCK DE COMPONENTES SHADCN/UI (Para asegurar la ejecución) ---
const Dialog = ({ open, onOpenChange, children }) => open ? <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4" onClick={() => onOpenChange(false)}>{children}</div> : null;
const DialogContent = ({ children }) => <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[95vh] overflow-hidden" onClick={e => e.stopPropagation()}>{children}</div>;
const DialogHeader = ({ children }) => <div className="p-4 border-b flex justify-between items-center">{children}</div>;
const DialogTitle = ({ children }) => <h2 className="text-xl font-semibold">{children}</h2>;
const Tabs = ({ defaultValue, children, value, onValueChange, className = "" }) => <div className="flex flex-col h-full ${className}">{children}</div>;
const TabsList = ({ children, className = "" }) => <div className={`flex bg-gray-100 p-1 rounded-lg w-full justify-start text-sm overflow-x-auto ${className}`}>{children}</div>;
const TabsTrigger = ({ value, children, onClick, className }) => <button onClick={onClick} className={`px-4 py-2 rounded-md transition-colors data-[state=active]:bg-white data-[state=active]:text-blue-600 font-medium whitespace-nowrap ${className}`} data-state={value === "beneficios" ? "active" : "inactive"}>{children}</button>;
const TabsContent = ({ value, children, className }) => <div className={`p-4 flex-grow overflow-y-auto ${className}`}>{children}</div>;
const Button = ({ variant, onClick, className, children, disabled, size }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`px-3 py-1.5 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            variant === 'destructive' ? 'bg-red-500 text-white hover:bg-red-600' : 
            variant === 'outline' ? 'border border-gray-300 text-gray-700 hover:bg-gray-100' :
            'bg-blue-600 text-white hover:bg-blue-700'
        } ${size === 'sm' ? 'h-8 text-sm' : 'h-10'} ${className}`}
    >
        {children}
    </button>
);
const Input = ({ placeholder, value, onChange, className }) => <input type="text" placeholder={placeholder} value={onChange} onChange={onChange} className={`w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${className}`} />;
const Badge = ({ variant, className, children }) => <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variant === 'secondary' ? 'bg-gray-200 text-gray-800' : 'bg-blue-100 text-blue-800'} ${className}`}>{children}</span>;
const ScrollArea = ({ children, className }) => <div className={`overflow-y-auto ${className}`}>{children}</div>;
const Card = ({ children, className }) => <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>{children}</div>;
const CardHeader = ({ children }) => <div className="p-4 border-b">{children}</div>;
const CardTitle = ({ children }) => <h3 className="text-lg font-bold">{children}</h3>;
const CardDescription = ({ children }) => <p className="text-sm text-gray-500 mt-1">{children}</p>;
const CardContent = ({ children }) => <div className="p-4">{children}</div>;
// --- FIN MOCK DE COMPONENTES ---


// --- INTERFACES (Definidas por el usuario) ---

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

// --- CONSTANTES Y ESTILOS GLOBALES ---

const ATTRIBUTE_GROUPS = [
    "Cobertura Ambulatoria",
    "Internación y Cirugías",
    "Odontología y Óptica",
    "Reintegros y Servicios"
];

// Estilos para la tabla sticky
const ComparisonStyles = `
    /* Contenedor que permite el scroll horizontal y vertical */
    .comparison-container {
        max-height: calc(90vh - 120px); 
        overflow: auto;
        padding-top: 0;
        padding-bottom: 0;
    }
    /* Fija la primera columna (Característica/Clínica) horizontalmente */
    .sticky-col {
        position: sticky;
        left: 0;
        z-index: 10;
        background-color: inherit; /* Hereda el color de la fila para el cebra */
        box-shadow: 2px 0 5px rgba(0,0,0,0.05);
    }
    /* Fija la fila de encabezado (planes) verticalmente */
    .sticky-header th {
        position: sticky;
        top: 0;
        z-index: 20;
        background-color: #ffffff; 
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        padding: 0; 
    }
    /* Celda de la esquina (Título de la columna) - Fija en ambas direcciones */
    .corner-cell {
        z-index: 30 !important;
        background-color: #f3f4f6 !important;
    }
    /* Estilo para el nombre del grupo de atributos/clínicas */
    .sticky-group-header {
        position: sticky;
        left: 0;
        z-index: 10;
        background-color: #e0f2fe !important; 
        box-shadow: 2px 0 5px rgba(0,0,0,0.05);
    }
`;


// --- COMPONENTES AUXILIARES ---

// Replicando el componente PlanHeader del usuario
const PlanHeader = React.memo(({ plan, onRemovePlan }) => (
    <div className="flex flex-col items-center justify-center p-3 h-full border-b border-gray-200 bg-gray-50/70">
        <div className="text-lg font-extrabold text-blue-600 truncate max-w-full">{plan.name}</div>
        <div className="text-xs text-gray-500">{plan.empresa}</div>
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


// --- COMPONENTE MODAL PRINCIPAL ---

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
  
  // Limpiar el estado de la búsqueda al abrir o cerrar
  useEffect(() => {
    if (!open) {
        setSearchTerm("");
        setActiveTab("beneficios");
        setActiveClinicaTab("todas");
    }
  }, [open]);


  // --- LÓGICA DE DATOS GENERALES ---
  
  // 1. Lógica para el Tab de Añadir/Buscar Planes
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
  
  
  // 2. Lógica para agrupar atributos (para la pestaña 'beneficios')
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

  // Función auxiliar para obtener el valor del atributo para un plan específico
  const getPlanAttributeValue = useCallback((plan: HealthPlan, attrName: string): string => {
    const attr = plan.attributes?.find(a => a.name === attrName);
    return attr ? attr.value_name : 'N/A';
  }, []);
  
  // --- LÓGICA DE DATOS DE CLÍNICAS ---

  // Obtener todas las clínicas únicas de los planes seleccionados
  const uniqueClinicas = useMemo(() => {
    const clinicaMap = new Map<string, Clinica>();
    plansToCompare.forEach(plan => {
        plan.clinicas?.forEach(clinica => {
            if (!clinicaMap.has(clinica.item_id)) {
                clinicaMap.set(clinica.item_id, clinica);
            }
        });
    });
    // Ordenar alfabéticamente por nombre de entidad
    return Array.from(clinicaMap.values()).sort((a, b) => a.entity.localeCompare(b.entity));
  }, [plansToCompare]);
  
  // Obtener regiones únicas para las pestañas de filtrado
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

  // Filtrar clínicas por región
  const getClinicasByRegion = useCallback((region: string): Clinica[] => {
    return uniqueClinicas.filter(clinica => 
        clinica.ubicacion?.some(ub => ub.region === region)
    );
  }, [uniqueClinicas]);

  // Verificar si un plan incluye una clínica
  const planIncludesClinica = useCallback((plan: HealthPlan, clinicaId: string): boolean => {
    return plan.clinicas?.some(clinica => clinica.item_id === clinicaId) ?? false;
  }, []);
  
  // --- RENDERIZADO DE LA TABLA DE COMPARACIÓN DE BENEFICIOS ---
  const renderBeneficiosTable = () => {
    if (plansToCompare.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full py-16 text-center text-gray-500">
          <Search className="w-10 h-10 mb-4 text-gray-400" />
          <p className="text-lg font-medium">No hay planes seleccionados para comparar beneficios.</p>
        </div>
      );
    }
    
    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Estilos CSS para el sticky scrolling */}
            <style dangerouslySetInnerHTML={{ __html: ComparisonStyles }} />
            
            <ScrollArea className="comparison-container w-full h-full max-h-[75vh]">
                <table className="min-w-full table-fixed divide-y divide-gray-200">
                    <thead className="sticky-header">
                        <tr>
                            {/* Columna de Característica (Sticky Horizontal y Vertical) */}
                            <th scope="col" className="w-48 px-4 py-3 sticky-col corner-cell bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">
                                Beneficio / Atributo
                            </th>
                            {/* Columnas de los Planes (Sticky Vertical) */}
                            {plansToCompare.map(plan => (
                                <th key={plan._id} scope="col" className="min-w-[250px] border-l border-gray-200">
                                    <PlanHeader plan={plan} onRemovePlan={onRemovePlan} />
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {Object.entries(groupedAttributes).map(([groupName, attrNames]) => (
                            <React.Fragment key={groupName}>
                                {/* Fila de Encabezado de Grupo (Sticky Horizontal) */}
                                <tr className="bg-blue-100/50">
                                    <th colSpan={plansToCompare.length + 1} className="p-0">
                                        <div className="px-4 py-2 font-bold text-blue-800 text-left sticky-group-header border-b border-blue-200">
                                            {groupName}
                                        </div>
                                    </th>
                                </tr>
                                
                                {/* Filas de Atributos del Grupo */}
                                {attrNames.map((attrName, index) => (
                                    <tr key={attrName} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        {/* Nombre del Atributo (Sticky Horizontal) */}
                                        <th scope="row" className="px-4 py-3 font-medium text-gray-900 sticky-col text-left text-sm">
                                            {attrName}
                                        </th>
                                        {/* Valores para cada Plan */}
                                        {plansToCompare.map(plan => {
                                            const value = getPlanAttributeValue(plan, attrName);
                                            return (
                                                <td key={`${plan._id}-${attrName}`} className="w-64 px-4 py-3 text-center border-l border-gray-100">
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

  // --- RENDERIZADO DE LA TABLA DE COMPARACIÓN DE CLÍNICAS (DETALLADA) ---
  const renderClinicasTable = (clinicas: Clinica[]) => {
    if (plansToCompare.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full py-16 text-center text-gray-500">
          <Search className="w-10 h-10 mb-4 text-gray-400" />
          <p className="text-lg font-medium">No hay planes seleccionados para comparar cartillas.</p>
        </div>
      );
    }
      
    if (clinicas.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <p>No se encontraron clínicas para esta selección.</p>
            </div>
        );
    }

    return (
        <div className="border rounded-lg overflow-hidden flex-1">
            <div className="overflow-x-auto">
                <table className="min-w-full table-fixed divide-y divide-gray-200">
                    <thead className="bg-muted sticky top-0 z-20">
                        <tr>
                            {/* Encabezado fijo de la columna izquierda (Clínica) */}
                            <th className="text-left p-3 font-semibold border-r border-border sticky left-0 bg-gray-100 z-10 min-w-[250px] corner-cell">
                                Clínica
                            </th>
                            {/* Encabezados de los planes (solo el nombre para la sub-tabla) */}
                            {plansToCompare.map(plan => (
                                <th 
                                    key={plan._id} 
                                    className="p-3 text-center font-bold text-sm border-l border-border min-w-[250px] bg-gray-100"
                                >
                                    {plan.name}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {/* ITERACIÓN Y LISTADO DE TODAS LAS CLÍNICAS */}
                        {clinicas.map((clinica, idx) => (
                            <tr 
                                key={clinica.item_id}
                                className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                            >
                                {/* Nombre de la Clínica (Sticky Horizontal) */}
                                <th scope="row" className="p-3 border-r border-border sticky left-0 bg-inherit z-10 min-w-[250px] text-left">
                                    <div>
                                        <p className="font-medium text-sm">{clinica.entity}</p>
                                        {clinica.ubicacion?.[0] && (
                                            <p className="text-xs text-gray-500">
                                                {clinica.ubicacion[0].barrio} - {clinica.ubicacion[0].region}
                                            </p>
                                        )}
                                    </div>
                                </th>
                                {/* Indicador de Cobertura por Plan */}
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
  }

  // --- RENDERIZADO DEL CONTENIDO DE LA PESTAÑA CLÍNICAS ---
  const renderClinicasContent = () => {
      // Determinar qué clínicas mostrar según la sub-pestaña activa
      const clinicasToShow = activeClinicaTab === "todas" 
          ? uniqueClinicas 
          : getClinicasByRegion(activeClinicaTab);

      return (
          <div className="flex flex-col h-full overflow-hidden">
              <style dangerouslySetInnerHTML={{ __html: ComparisonStyles }} />
              
              {/* Encabezados de Planes Fijos Arriba de la Sub-Tabla (Fijos verticalmente) */}
              <div className="w-full overflow-x-auto border-b border-gray-200 bg-white shadow-sm sticky top-0 z-40">
                <table className="min-w-full table-fixed">
                    <thead>
                        <tr>
                            {/* Columna vacía para alinear con la columna fija de clínicas */}
                            <th className="w-48 px-4 py-3 sticky left-0 bg-white z-10 min-w-[250px] border-r border-border">
                                {/* Espacio para alinear */}
                            </th>
                            {plansToCompare.map(plan => (
                                <th key={plan._id} className="min-w-[250px] border-l border-gray-200 p-0">
                                    <PlanHeader plan={plan} onRemovePlan={onRemovePlan} />
                                </th>
                            ))}
                        </tr>
                    </thead>
                </table>
              </div>
              
              {/* Navegación por Región (Tabs anidados) */}
              <Tabs 
                defaultValue="todas" 
                value={activeClinicaTab} 
                onValueChange={setActiveClinicaTab} 
                className="flex flex-col flex-1 mt-0 h-full overflow-hidden"
              >
                <div className="px-4 pt-4 border-b bg-white z-30">
                    <TabsList className="w-full justify-start border-b border-gray-200 p-0 rounded-none">
                      <TabsTrigger 
                          value="todas" 
                          onClick={() => setActiveClinicaTab("todas")}
                          className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent"
                      >
                          Todas ({uniqueClinicas.length})
                      </TabsTrigger>
                      {regions.map(region => (
                          <TabsTrigger 
                              key={region} 
                              value={region} 
                              onClick={() => setActiveClinicaTab(region)}
                              className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent"
                          >
                              {region} ({getClinicasByRegion(region).length})
                          </TabsTrigger>
                      ))}
                    </TabsList>
                </div>
                
                {/* Área de scroll para el contenido de la tabla de clínicas */}
                <ScrollArea className="flex-1 overflow-y-auto w-full h-full p-4 pt-0">
                    <TabsContent value={activeClinicaTab} className="p-0 pt-4">
                        {/* ESTE ES EL RENDERIZADO DE LA LISTA COMPLETA DE CLÍNICAS */}
                        {renderClinicasTable(clinicasToShow)} 
                    </TabsContent>
                </ScrollArea>
              </Tabs>
          </div>
      );
  };
  

  // 4. Renderizado de la Búsqueda (Tab 3)
  const renderAddPlanTab = () => (
    <div className="flex flex-col space-y-4 h-full">
      <div className="relative">
        <Input 
          placeholder="Buscar planes por nombre o línea..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
      </div>

      <ScrollArea className="flex-grow h-full max-h-[500px]">
        {plansToAdd.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
                <p>No se encontraron planes disponibles o ya están todos comparados.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plansToAdd.map(plan => (
                    <Card key={plan._id}>
                        <CardHeader>
                            <CardTitle className="flex justify-between items-start">
                                {plan.name}
                                <Badge>{plan.linea}</Badge>
                            </CardTitle>
                            <CardDescription className="text-base font-semibold text-green-600">${plan.price}</CardDescription>
                            <CardDescription>{plan.empresa}</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-2">
                            <ul className="text-xs text-gray-600 space-y-1 mb-3">
                                <li><Check className="w-3 h-3 inline mr-1 text-green-500" /> Cobertura Ambulatoria Básica</li>
                                <li><Check className="w-3 h-3 inline mr-1 text-green-500" /> **{plan.clinicas?.length || 0} Clínicas** en Cartilla</li>
                            </ul>
                            <Button 
                                onClick={() => onAddPlan(plan._id)} 
                                className="w-full"
                                disabled={plansToCompare.length >= 4} // Limitar a 4 planes
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Añadir a Comparación
                            </Button>
                            {plansToCompare.length >= 4 && (
                                <p className="text-xs text-center text-red-500 mt-2">Máximo 4 planes</p>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        )}
      </ScrollArea>
    </div>
  );


  // 5. Estructura del Modal
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          {/* Título simplificado para ahorrar espacio en el encabezado */}
          <DialogTitle>Comparación de Planes de Salud</DialogTitle> 
          <Button variant="outline" onClick={() => onOpenChange(false)} className="h-8 w-8 p-0 ml-auto">
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <div className="p-0 h-full flex flex-col">
            <Tabs defaultValue="beneficios" value={activeTab} onValueChange={setActiveTab}>
                <div className="px-4 pt-2">
                    <TabsList>
                        <TabsTrigger value="beneficios" onClick={() => setActiveTab("beneficios")}>
                            Beneficios
                        </TabsTrigger>
                        <TabsTrigger value="clinicas" onClick={() => setActiveTab("clinicas")}>
                            Clínicas y Red
                        </TabsTrigger>
                        <TabsTrigger value="add" onClick={() => setActiveTab("add")}>
                            Añadir Plan
                        </TabsTrigger>
                    </TabsList>
                </div>

                <div className="flex-grow overflow-hidden">
                    {/* Contenido de Beneficios */}
                    {activeTab === "beneficios" && (
                        <TabsContent value="beneficios" className="h-full p-0">
                            {renderBeneficiosTable()}
                        </TabsContent>
                    )}

                    {/* Contenido de Clínicas (Lista Detallada) */}
                    {activeTab === "clinicas" && (
                        <TabsContent value="clinicas" className="h-full p-0">
                            {renderClinicasContent()}
                        </TabsContent>
                    )}

                    {/* Contenido de Añadir Plan */}
                    {activeTab === "add" && (
                        <TabsContent value="add" className="h-full p-4">
                            {renderAddPlanTab()}
                        </TabsContent>
                    )}
                </div>
            </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};