import { X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
  images?: Image[];
}

interface ComparisonBarProps {
  plans: HealthPlan[];
  onRemove: (planId: string) => void;
  onCompare: () => void;
  isComparisonModalOpen?: boolean;
}

export const ComparisonBar = ({ plans, onRemove, onCompare, isComparisonModalOpen }: ComparisonBarProps) => {
  if (plans.length === 0 || isComparisonModalOpen) return null;

  const canCompare = plans.length >= 2 && plans.length <= 3;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border shadow-lg z-50 p-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-foreground">
            Planes para comparar ({plans.length})
          </h3>
          {canCompare && (
            <Button variant="default" size="sm" onClick={onCompare}>
              Comparar ahora
            </Button>
          )}
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {plans.map((plan) => (
            <Card
              key={plan._id}
              className="flex items-center gap-3 p-3 min-w-[250px] relative"
            >
              <button
                onClick={() => onRemove(plan._id)}
                className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Eliminar de comparación"
              >
                <X className="h-4 w-4" />
              </button>
              {plan.images && plan.images[0] && (
                <img
                  src={`/${plan.images[0].url}`}
                  alt={plan.empresa}
                  className="w-12 h-12 object-contain"
                />
              )}
              <div className="flex-1">
                <p className="font-medium text-sm text-foreground">{plan.name}</p>
                <p className="text-xs text-muted-foreground">{plan.empresa}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
