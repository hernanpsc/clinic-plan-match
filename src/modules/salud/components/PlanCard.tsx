import { Plus, Minus } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { HealthPlan } from "@/services/health.service";

interface PlanCardProps {
  plan: HealthPlan;
  viewMode: "grid" | "list";
  isInComparison: boolean;
  onToggleComparison: (planId: string) => void;
  onOpenDetails: (plan: HealthPlan) => void;
}

export const PlanCard = ({
  plan,
  viewMode,
  isInComparison,
  onToggleComparison,
  onOpenDetails,
}: PlanCardProps) => {
  return (
    <Card 
      className={`${viewMode === "list" ? "flex flex-col md:flex-row" : ""} overflow-hidden hover:shadow-colorful transition-all duration-300 border-border/50`}
    >
      {/* Logo Container */}
      {plan.images && plan.images[0] && (
        <div className={`${viewMode === "list" ? "md:w-24 md:min-w-24" : "w-full h-20"} bg-gradient-to-br from-muted/30 to-muted/10 flex items-center justify-center border-b border-border/30 p-3`}>
          <img
            src={`/${plan.images[0].url}`}
            alt={plan.empresa}
            className="max-h-10 max-w-full object-contain opacity-90"
          />
        </div>
      )}
      <div className="flex-1 flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-semibold truncate">{plan.name}</CardTitle>
              <CardDescription className="text-xs mt-1">{plan.empresa}</CardDescription>
            </div>
            <Badge variant="secondary" className="flex items-center gap-1 px-2 py-1 flex-shrink-0 bg-accent/10 text-accent-foreground border-accent/20">
              <span className="text-xs">⭐</span>
              <span className="text-xs font-semibold">{plan.rating}</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-1 py-3">
          <p className="text-xs font-medium text-muted-foreground mb-3 bg-muted/30 px-2 py-1 rounded inline-block">{plan.linea}</p>
          <ul className="space-y-2">
            {plan.attributes?.slice(0, 3).map((attr, idx) => (
              <li key={`${plan._id}-attr-${idx}`} className="text-xs flex items-start gap-2">
                <span className="text-primary mt-0.5 flex-shrink-0">✓</span>
                <span className="flex-1">
                  <span className="font-semibold text-foreground">{attr.name}:</span>{" "}
                  <span className="text-muted-foreground">{attr.value_name}</span>
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 pt-3 border-t border-border/30">
          <div className="flex items-center justify-between w-full">
            <div>
              <div className="text-2xl font-bold text-primary">${plan.price}</div>
              <div className="text-[10px] text-muted-foreground">por mes</div>
            </div>
            <Button 
              variant={isInComparison ? "default" : "outline"}
              size="sm"
              onClick={() => onToggleComparison(plan._id)}
              className="flex items-center gap-1.5"
              title={isInComparison ? "Remover de comparación" : "Agregar a comparación"}
            >
              {isInComparison ? (
                <>
                  <Minus className="h-3.5 w-3.5" />
                  <span className="text-xs">Quitar</span>
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" />
                  <span className="text-xs">Comparar</span>
                </>
              )}
            </Button>
          </div>
          <Button 
            className="w-full"
            onClick={() => onOpenDetails(plan)}
            variant="secondary"
          >
            Ver Detalles
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
};
