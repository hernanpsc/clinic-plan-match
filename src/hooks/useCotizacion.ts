import { useState, useEffect, useCallback } from 'react';
import { QuoteFormData } from '@/data/interfaces/quoteFormData';

const STORAGE_KEY = 'last_cotizacion_form';

// Initial form state
const initialFormData: QuoteFormData = {
  _id: '',
  group: null,
  empresa_prepaga: 0,
  edad_1: 18,
  edad_2: 0,
  numkids: 0,
  zone_type: '',
  edadHijo1: 0,
  edadHijo2: 0,
  edadHijo3: 0,
  edadHijo4: 0,
  edadHijo5: 0,
  tipo: '',
  agree: true,
  aporteOS: 0,
  sueldo: 0,
  aporte: 0,
  categoriaMono: '',
  monoadic: 0,
  cantAport: 0,
  afinidad: false,
  bonAfinidad: 0,
  personalData: {
    name: '',
    email: '',
    phone: '',
    region: '',
    medioContacto: ''
  }
};

interface UseCotizacionReturn {
  formData: QuoteFormData;
  setFormData: (data: QuoteFormData) => void;
  updateFormData: (fields: Partial<QuoteFormData>) => void;
  savedFormData: QuoteFormData | null;
  showRecoveryModal: boolean;
  setShowRecoveryModal: (show: boolean) => void;
  handleRecoverForm: () => void;
  handleStartNew: () => void;
  saveFormToStorage: (data: QuoteFormData) => void;
  clearStoredForm: () => void;
  isFormDirty: boolean;
  initialFormData: QuoteFormData;
}

export const useCotizacion = (): UseCotizacionReturn => {
  const [formData, setFormDataState] = useState<QuoteFormData>(initialFormData);
  const [savedFormData, setSavedFormData] = useState<QuoteFormData | null>(null);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [hasCheckedStorage, setHasCheckedStorage] = useState(false);

  // Check localStorage on mount
  useEffect(() => {
    if (hasCheckedStorage) return;
    
    try {
      const storedForm = localStorage.getItem(STORAGE_KEY);
      if (storedForm) {
        const parsedForm = JSON.parse(storedForm) as QuoteFormData;
        // Validate that the stored form has essential data
        if (parsedForm.group !== null && parsedForm.group !== undefined) {
          setSavedFormData(parsedForm);
          setShowRecoveryModal(true);
        }
      }
    } catch (error) {
      console.error('Error reading stored form:', error);
      localStorage.removeItem(STORAGE_KEY);
    }
    setHasCheckedStorage(true);
  }, [hasCheckedStorage]);

  // Save form to localStorage
  const saveFormToStorage = useCallback((data: QuoteFormData) => {
    try {
      // Only save if form has meaningful data
      if (data.group !== null) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        setIsFormDirty(true);
      }
    } catch (error) {
      console.error('Error saving form to storage:', error);
    }
  }, []);

  // Clear stored form
  const clearStoredForm = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setSavedFormData(null);
      setIsFormDirty(false);
    } catch (error) {
      console.error('Error clearing stored form:', error);
    }
  }, []);

  // Set form data and optionally save to storage
  const setFormData = useCallback((data: QuoteFormData) => {
    setFormDataState(data);
    saveFormToStorage(data);
  }, [saveFormToStorage]);

  // Update partial form data
  const updateFormData = useCallback((fields: Partial<QuoteFormData>) => {
    setFormDataState(prev => {
      const updated = { ...prev, ...fields };
      saveFormToStorage(updated);
      return updated;
    });
  }, [saveFormToStorage]);

  // Recover saved form
  const handleRecoverForm = useCallback(() => {
    if (savedFormData) {
      setFormDataState(savedFormData);
      setShowRecoveryModal(false);
    }
  }, [savedFormData]);

  // Start with new form
  const handleStartNew = useCallback(() => {
    clearStoredForm();
    setFormDataState(initialFormData);
    setShowRecoveryModal(false);
  }, [clearStoredForm]);

  return {
    formData,
    setFormData,
    updateFormData,
    savedFormData,
    showRecoveryModal,
    setShowRecoveryModal,
    handleRecoverForm,
    handleStartNew,
    saveFormToStorage,
    clearStoredForm,
    isFormDirty,
    initialFormData
  };
};

// Helper to get group description
export const getGroupDescription = (group: number | null): string => {
  switch (group) {
    case 1: return 'Individual';
    case 2: return 'Titular + Hijos';
    case 3: return 'Pareja';
    case 4: return 'Pareja + Hijos';
    default: return 'Sin definir';
  }
};

// Helper to get family summary
export const getFamilySummary = (formData: QuoteFormData): string => {
  const parts: string[] = [];
  
  if (formData.edad_1 > 0) {
    parts.push(`Titular: ${formData.edad_1} años`);
  }
  
  if (formData.edad_2 > 0 && (formData.group === 3 || formData.group === 4)) {
    parts.push(`Pareja: ${formData.edad_2} años`);
  }
  
  if (formData.numkids > 0) {
    const childAges: number[] = [];
    if (formData.edadHijo1) childAges.push(formData.edadHijo1);
    if (formData.edadHijo2) childAges.push(formData.edadHijo2);
    if (formData.edadHijo3) childAges.push(formData.edadHijo3);
    if (formData.edadHijo4) childAges.push(formData.edadHijo4);
    if (formData.edadHijo5) childAges.push(formData.edadHijo5);
    
    if (childAges.length > 0) {
      parts.push(`${childAges.length} hijo${childAges.length > 1 ? 's' : ''}: ${childAges.join(', ')} años`);
    }
  }
  
  return parts.join(' • ');
};

export default useCotizacion;
