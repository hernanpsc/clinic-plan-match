import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import type { HealthPlan } from "@/services/health.service";

interface PlanDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: HealthPlan | null;
  isInComparison: boolean;
  onToggleComparison: (planId: string) => void;
  onRequestQuote: () => void;
}

export const PlanDetailsModal = ({
  open,
  onOpenChange,
  plan,
  isInComparison,
  onToggleComparison,
  onRequestQuote,
}: PlanDetailsModalProps) => {
  if (!plan) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">{plan.name}</DialogTitle>
          <DialogDescription className="text-base">
            {plan.empresa} - {plan.linea}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="info" className="flex-1 flex flex-col overflow-hidden mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">Información</TabsTrigger>
            <TabsTrigger value="pdf" disabled={!plan.folleto?.[0]}>
              PDF del Plan
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="info" className="flex-1 overflow-y-auto space-y-6 mt-4">
            {/* Logo */}
            {plan.images && plan.images[0] && (
              <div className="flex justify-center p-4 bg-gradient-to-br from-muted/30 to-muted/10 rounded-lg border border-border/30">
                <img
                  src={`/${plan.images[0].url}`}
                  alt={plan.empresa}
                  className="max-h-12 object-contain opacity-90"
                />
              </div>
            )}

            {/* Precio y Rating */}
            <div className="flex items-center justify-between p-6 bg-muted/30 rounded-lg">
              <div>
                <div className="text-3xl font-bold text-primary">${plan.price}</div>
                <div className="text-sm text-muted-foreground">por mes</div>
              </div>
              <div className="flex items-center gap-2 bg-accent px-4 py-2 rounded-lg">
                <span className="text-lg font-medium">⭐ {plan.rating}</span>
              </div>
            </div>

            {/* Atributos completos */}
            {plan.attributes && plan.attributes.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Beneficios y Coberturas</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {plan.attributes.map((attr, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-3 bg-muted/20 rounded-lg">
                      <span className="text-primary mt-0.5">✓</span>
                      <div className="flex-1">
                        <span className="font-medium text-sm">{attr.name}:</span>{" "}
                        <span className="text-sm text-muted-foreground">{attr.value_name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Clínicas */}
            {plan.clinicas && plan.clinicas.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Clínicas Disponibles ({plan.clinicas.length})</h3>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {plan.clinicas.slice(0, 10).map((clinica, idx) => (
                    <div key={idx} className="p-2 bg-muted/20 rounded text-sm">
                      {clinica.entity}
                    </div>
                  ))}
                  {plan.clinicas.length > 10 && (
                    <p className="text-sm text-muted-foreground text-center pt-2">
                      Y {plan.clinicas.length - 10} clínicas más...
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex gap-3 pt-4 border-t border-border">
              <Button 
                variant={isInComparison ? "default" : "outline"}
                onClick={() => onToggleComparison(plan._id)}
                className="flex-1"
              >
                {isInComparison ? "Quitar de comparación" : "Agregar a comparación"}
              </Button>
              <Button onClick={onRequestQuote} className="flex-1">
                Solicitar Cotización
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="pdf" className="flex-1 overflow-hidden mt-4">
            {plan.folleto?.[0] ? (
              <div className="h-full w-full rounded-lg overflow-hidden border border-border">
                <iframe
                  src={plan.folleto[0]}
                  className="w-full h-full min-h-[600px]"
                  title={`PDF - ${plan.name}`}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>No hay PDF disponible para este plan</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
