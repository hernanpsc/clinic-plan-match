import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Users, RefreshCw, Plus } from 'lucide-react';
import { QuoteFormData } from '@/data/interfaces/quoteFormData';
import { getGroupDescription, getFamilySummary } from '@/hooks/useCotizacion';

interface QuoteRecoveryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  savedFormData: QuoteFormData | null;
  onRecover: () => void;
  onStartNew: () => void;
}

const QuoteRecoveryModal: React.FC<QuoteRecoveryModalProps> = ({
  open,
  onOpenChange,
  savedFormData,
  onRecover,
  onStartNew
}) => {
  if (!savedFormData) return null;

  const groupDescription = getGroupDescription(savedFormData.group);
  const familySummary = getFamilySummary(savedFormData);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <AlertDialogTitle className="text-xl">
              Cotización encontrada
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-left space-y-4">
            <p className="text-muted-foreground">
              Encontramos una cotización guardada de tu última visita. ¿Querés continuar con esos datos?
            </p>
            
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="font-medium">
                  {groupDescription}
                </Badge>
              </div>
              
              {familySummary && (
                <p className="text-sm text-foreground font-medium">
                  {familySummary}
                </p>
              )}
              
              {savedFormData.tipo && (
                <p className="text-sm text-muted-foreground">
                  Tipo de ingreso: {savedFormData.tipo === 'D' ? 'Dependiente' : 'Particular'}
                  {savedFormData.tipo === 'D' && savedFormData.sueldo > 0 && (
                    <span> • Sueldo: ${savedFormData.sueldo.toLocaleString('es-AR')}</span>
                  )}
                </p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel 
            onClick={onStartNew}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Iniciar una nueva
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onRecover}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90"
          >
            <RefreshCw className="h-4 w-4" />
            Continuar y actualizar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default QuoteRecoveryModal;
