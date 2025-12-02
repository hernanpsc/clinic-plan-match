import { Search } from "lucide-react";
import { PlanCard } from "./PlanCard";
import type { HealthPlan } from "@/services/health.service";

interface ResultsGridProps {
  plans: HealthPlan[];
  loading: boolean;
  viewMode: "grid" | "list";
  comparisonPlans: string[];
  onToggleComparison: (planId: string) => void;
  onOpenDetails: (plan: HealthPlan) => void;
}

export const ResultsGrid = ({
  plans,
  loading,
  viewMode,
  comparisonPlans,
  onToggleComparison,
  onOpenDetails,
}: ResultsGridProps) => {
  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Cargando planes...</p>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="text-center py-12 bg-card border border-border rounded-xl p-8">
        <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground">No se encontraron planes con los filtros seleccionados</p>
      </div>
    );
  }

  return (
    <div className={
      viewMode === "grid"
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        : "flex flex-col gap-4"
    }>
      {plans.map(plan => (
        <PlanCard
          key={plan._id}
          plan={plan}
          viewMode={viewMode}
          isInComparison={comparisonPlans.includes(plan._id)}
          onToggleComparison={onToggleComparison}
          onOpenDetails={onOpenDetails}
        />
      ))}
    </div>
  );
};
