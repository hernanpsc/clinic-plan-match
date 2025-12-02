import React, { useState, useCallback, useMemo, useEffect, useRef, SVGProps } from 'react';
import { JSX } from 'react/jsx-runtime';
import { useToast } from '@/hooks/use-toast';
import { submitQuote, type QuoteFormData } from '@/services/health.service';
// Define the custom primary color for consistency with the Angular component's styling
const PRIMARY_COLOR = '#4d72aa';
const SECONDARY_COLOR = '#c4e2ff';
const DANGER_COLOR = '#d9534f';
const INFO_COLOR = '#e6f0ff';
const DELETE_COLOR = '#cc0000';

// Inline Lucide Icons (React props style)

// User Icon (Individual)
const UserIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);

// Users Icon (Pareja)
const UsersIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

// User Plus Icon (Titular + Hijos)
const UserPlusIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-plus">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8v6"/><path d="M23 11h-6"/>
  </svg>
);

// Users Plus Icon (Pareja + Hijos)
const UsersPlusIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users-plus">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8v6"/><path d="M23 11h-6"/><path d="M17.5 17.5v-10h-1"/>
  </svg>
);

// Phone Icon (Contacto)
const PhoneIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-phone">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-3.67-2.61L7.54 13.91l1.84-1.84 2.87-2.87 1.84-1.84 2.61-3.67A19.5 19.5 0 0 1 19.92 4A2 2 0 0 1 22 6.18v3.63"/>
  </svg>
);

// Message Square Icon (Whatsapp)
const MessageSquareIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-square">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

// Initial form state structure, mirroring the Angular form group.
const initialFormData = {
  _id: '',
  group: null as number | null,
  empresa_prepaga: 0,
  edad_1: 18, // Titular
  edad_2: 0, // Pareja
  numkids: 0, // Cantidad de Hijos
  zone_type: '',
  edadHijo1: 0, // Max 5 kids supported
  edadHijo2: 0,
  edadHijo3: 0,
  edadHijo4: 0,
  edadHijo5: 0,
  tipo: '', // D or P
  agree: true,
  aporteOS: 0,
  sueldo: 0, // Sueldo Bruto
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


const FormQuote = () => {
  const { toast } = useToast();
  // --- State Variables ---
  const [activeStep, setActiveStep] = useState(1);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null); // 1, 2, 3, 4
  const [edadTitular, setEdadTitular] = useState(18);
  const [edadConyuge, setEdadConyuge] = useState(0);
  const [cantidadHijos, setCantidadHijos] = useState(0);
  const [sueldoInput, setSueldoInput] = useState('');
  const [aportesType, setAportesType] = useState<string | null>(null); // 'D' or 'P'
  const [cotizacionVisible, setCotizacionVisible] = useState(false);
  const [contactoType, setContactoType] = useState<string | null>(null); // 'phone' or 'whatsapp'
  const [formData, setFormData] = useState(initialFormData);

  // --- Refs for continuous increment/decrement ---
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- Utility Functions ---

  // Replicates Angular's FormBuilder.group/patchValue logic
  const updateFormData = useCallback((fields: any) => {
    setFormData(prev => ({ ...prev, ...fields }));
  }, []);

  const updatePersonalData = useCallback((field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      personalData: {
        ...prev.personalData,
        [field]: value
      }
    }));
  }, []);

  const updateChildAge = useCallback((index: number, value: number) => {
    const controlName = `edadHijo${index + 1}`;
    updateFormData({ [controlName]: value });
  }, [updateFormData]);
  
  // Update main form data when ages change (like Angular's patchValue in hook)
  useEffect(() => {
    updateFormData({ 
      edad_1: edadTitular,
      edad_2: edadConyuge,
      numkids: cantidadHijos,
    });
  }, [edadTitular, edadConyuge, cantidadHijos, updateFormData]);


  // --- Step 1 Handlers (Grupo Familiar) ---

  const selectGroup = (group: number) => {
    setSelectedGroup(group);
    updateFormData({ group });

    // Reset ages based on new group (Angular's resetAges logic)
    if (group === 1 || group === 3) {
      setCantidadHijos(0);
    }
    if (group === 1 || group === 2) {
      setEdadConyuge(0);
    }
    // Reset all child ages in form data
    const resetChildren: any = {};
    for (let i = 1; i <= 5; i++) {
      resetChildren[`edadHijo${i}`] = 0;
    }
    updateFormData(resetChildren);
  };

  const incrementar = (member: string) => {
    if (member === 'titular') {
      setEdadTitular(prev => prev + 1);
    } else if (member === 'conyuge' && selectedGroup && selectedGroup > 2) {
      setEdadConyuge(prev => prev + 1);
    } else if (member === 'hijos' && cantidadHijos < 5) {
      setCantidadHijos(prev => {
        const newCount = prev + 1;
        // Set initial age for the new child (Angular's logic was 1)
        updateChildAge(newCount - 1, 1);
        return newCount;
      });
    }
  };

  const decrementar = (member: string) => {
    if (member === 'titular' && edadTitular > 18) {
      setEdadTitular(prev => prev - 1);
    } else if (member === 'conyuge' && edadConyuge > 0 && selectedGroup && selectedGroup > 2) {
      setEdadConyuge(prev => prev - 1);
    } else if (member === 'hijos' && cantidadHijos > 0) {
      setCantidadHijos(prev => {
        const newCount = prev - 1;
        // Reset the age of the child being removed
        updateChildAge(prev - 1, 0);
        return newCount;
      });
    }
  };

  const incrementarChildAge = (index: number) => {
    const currentAge = (formData as any)[`edadHijo${index + 1}`] || 0;
    updateChildAge(index, currentAge + 1);
  };

  const decrementarChildAge = (index: number) => {
    const currentAge = (formData as any)[`edadHijo${index + 1}`] || 0;
    if (currentAge > 0) {
      updateChildAge(index, currentAge - 1);
    }
  };

  const getChildAgeControls = useMemo(() => {
    return Array.from({ length: cantidadHijos }, (_, i) => i);
  }, [cantidadHijos]);

  // --- Continuous increment/decrement handlers ---
  const startContinuousAction = (action: () => void) => {
    // Execute immediately
    action();
    
    // Wait 500ms before starting continuous action
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        action();
      }, 100); // Repeat every 100ms
    }, 500);
  };

  const stopContinuousAction = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopContinuousAction();
    };
  }, []);

  // --- Step 2 Handlers (Forma de Ingreso) ---

  const selectAportesType = (tipo: string) => {
    setAportesType(tipo);
    updateFormData({ tipo });

    if (tipo === 'P') {
      // Clear sueldo if P is selected
      setSueldoInput('');
      updateFormData({ sueldo: 0 });
    }
  };

  const addNumber = (num: number) => {
    if (sueldoInput.length < 10) {
      const newSueldoInput = sueldoInput + num.toString();
      setSueldoInput(newSueldoInput);
      updateFormData({ sueldo: parseInt(newSueldoInput, 10) || 0 });
    }
  };

  const deleteNumber = () => {
    const newSueldoInput = sueldoInput.slice(0, -1);
    setSueldoInput(newSueldoInput);
    updateFormData({ sueldo: parseInt(newSueldoInput, 10) || 0 });
  };

  const formattedSueldo = useMemo(() => {
    const sueldoValue = formData.sueldo;
    if (!sueldoValue || isNaN(sueldoValue)) return '';
    // Use Intl.NumberFormat for Spanish locale formatting
    return new Intl.NumberFormat('es-AR', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(sueldoValue);
  }, [formData.sueldo]);


  // --- Step 3 Handlers (Datos Personales) ---

  const isPersonalDataValid = useMemo(() => {
    const pd = formData.personalData;
    return pd.name.trim() !== '' &&
           pd.phone.trim() !== '' &&
           /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pd.email);
  }, [formData.personalData]);

  const verCotizacion = () => {
    if (isPersonalDataValid) {
      setCotizacionVisible(true);
    } else {
      console.error('Por favor, completa todos los campos personales correctamente.');
      // In a real app, you'd show a visible error message here.
    }
  };

  const selectContactoType = (type: string) => {
    setContactoType(type);
    updatePersonalData('medioContacto', type);
    submitFormManually();
  };

  const submitFormManually = async () => {
    console.log('--- Formulario Finalizado y Enviado ---');
    console.log(formData);
    
    toast({
      title: "Enviando cotización...",
      description: "Por favor espera mientras procesamos tu solicitud",
    });

    const quoteData: QuoteFormData = {
      group: formData.group,
      edad_1: formData.edad_1,
      edad_2: formData.edad_2,
      numkids: formData.numkids,
      edadHijo1: formData.edadHijo1,
      edadHijo2: formData.edadHijo2,
      edadHijo3: formData.edadHijo3,
      edadHijo4: formData.edadHijo4,
      edadHijo5: formData.edadHijo5,
      zone_type: formData.zone_type,
      tipo: formData.tipo,
      sueldo: formData.sueldo,
      aporteOS: formData.aporteOS,
      personalData: formData.personalData
    };

    const result = await submitQuote(quoteData);

    if (!result.success) {
      console.error('Error al enviar cotización:', result.error);
      toast({
        title: "Error al enviar",
        description: "No pudimos procesar tu cotización. Por favor intenta nuevamente.",
        variant: "destructive"
      });
    } else {
      console.log('Cotización enviada exitosamente:', result.data);
      toast({
        title: "¡Cotización enviada!",
        description: "Hemos recibido tu solicitud. Te contactaremos pronto.",
      });
    }
  };

  // --- Step Navigation ---

  const goToNextStep = () => {
    if (activeStep === 1 && selectedGroup !== null) {
      setActiveStep(2);
    } else if (activeStep === 2 && aportesType !== null) {
      if (aportesType === 'D' && formData.sueldo === 0) {
        console.error("Por favor, ingrese un sueldo bruto válido.");
        return;
      }
      setActiveStep(3);
    }
  };

  const goToPrevStep = () => {
    setActiveStep(prev => prev - 1);
  };


  // --- Component JSX Render ---

  // Custom CSS for variables and complex selectors
  const customStyles = `
    .main-container {
      font-family: 'Inter', sans-serif;
    }
    .flex-container {
      display: flex;
      flex-direction: row;
      justify-content: center;
      gap: 1rem;
    }

    .btn-group, .btn-choice {
      /* Base styles for all large buttons */
      min-width: 120px;
      height: 120px;
      text-align: center;
      background-color: #fff;
      padding: 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border: 2px solid #ccc;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      font-weight: 600;
      color: #4e636d;
      cursor: pointer;
      transition: all 0.2s ease-in-out;
    }

    .btn-group:hover, .btn-choice:hover {
      border-color: ${PRIMARY_COLOR};
      background-color: ${SECONDARY_COLOR};
    }
    
    .btn-group.active, .btn-choice.active {
      border-color: ${PRIMARY_COLOR};
      background-color: ${SECONDARY_COLOR};
      color: ${PRIMARY_COLOR};
      transform: translateY(-2px);
      box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
    }
    
    .btn-group svg {
      width: 40px;
      height: 40px;
      margin-bottom: 5px;
      color: #66a9d8;
    }
    .btn-group.active svg {
      color: ${PRIMARY_COLOR};
    }

    /* Step 2 specific styles */
    .btn-choice {
      height: 80px;
      font-size: 0.9rem;
      flex-basis: 50%;
      min-width: 100px;
      padding: 10px;
    }

    /* Incrementer/Decrementer styles */
    .flex-contenedor {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 35px;
    }

    .btn.inner-square-cuatro-div {
      width: 35px;
      height: 35px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      border: 1px solid #ccc;
      background-color: #f0f0f0;
      font-size: 1.2rem;
      font-weight: bold;
      color: #4e636d;
      transition: background-color 0.1s;
    }

    .btn.inner-square-cuatro-div:hover {
      background-color: #ddd;
    }

    .btn.inner-square-cuatro-div.mas {
      background-color: ${INFO_COLOR};
      color: ${PRIMARY_COLOR};
    }
    .btn.inner-square-cuatro-div.menos {
      background-color: #fce6e6;
      color: ${DANGER_COLOR};
    }

    /* Numeric Pad */
    .numpad {
      grid-template-columns: repeat(3, 1fr);
      gap: 0.5rem;
    }
    .btn-pad {
      padding: 1rem;
      font-size: 1.25rem;
      font-weight: bold;
      border-radius: 8px;
      background-color: #e0e0e0;
      transition: background-color 0.1s;
    }
    .btn-pad:hover {
      background-color: #ccc;
    }
    .btn-pad.delete {
      background-color: #f9dcdc;
      color: ${DELETE_COLOR};
    }
    .btn-pad.listo {
      grid-column: span 3;
      background-color: ${PRIMARY_COLOR};
      color: white;
    }

    /* Form Styles */
    .form-group label {
      display: block;
      font-weight: 600;
      margin-bottom: 5px;
      color: #585858;
    }
    .form-group input {
      width: 100%;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 6px;
      font-size: 1rem;
      transition: border-color 0.2s;
    }
    .form-group input:focus {
      outline: none;
      border-color: ${PRIMARY_COLOR};
    }
    .error span {
      display: block;
      color: #ff0f03;
      font-size: 0.8rem;
      margin-top: 5px;
    }
    
    .contact-btn {
      height: 100px;
      width: 100%;
      border-radius: 12px;
      font-size: 0.8rem;
      text-transform: uppercase;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 10px;
      border: 2px solid #ccc;
      background-color: #fff;
      font-weight: 600;
      color: #4e636d;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transition: all 0.2s ease-in-out;
    }

    .contact-btn:hover {
      border-color: ${PRIMARY_COLOR};
      background-color: ${SECONDARY_COLOR};
    }

    .contact-btn svg {
      margin-bottom: 5px;
    }


    @media (max-width: 640px) {
      .flex-container {
        gap: 0.5rem;
      }
      .btn-group {
        min-width: 90px;
        height: 90px;
      }
      .btn-group svg {
        width: 30px;
        height: 30px;
      }
      .btn-choice {
        min-width: unset;
        height: 70px;
        padding: 5px;
        font-size: 0.8rem;
      }
      .btn-pad {
        padding: 0.75rem;
      }
    }
  `;

  // Helper for progress bar classes
  const getStepClass = (step: number) =>
    activeStep === step
      ? `bg-[${PRIMARY_COLOR}] text-white`
      : 'bg-gray-200 text-gray-600';

  // Helper for button active classes
  const getButtonClass = (group: number) =>
    `btn-group ${selectedGroup === group ? 'active' : ''}`;


  return (
    <>
      <style>{customStyles}</style>
      <div className="main-container w-full p-6 sm:p-8 bg-background">
        <h1 style={{ color: PRIMARY_COLOR }} className="text-2xl font-bold text-center mb-8">Cotizador de Planes</h1>

        {/* Progress/Step Indicator */}
        <div className="flex justify-between text-xs sm:text-sm font-semibold mb-8">
          <div className="text-center w-1/3">
            <div className={`w-6 h-6 rounded-full mx-auto mb-1 flex items-center justify-center ${getStepClass(1)}`}>1</div>
            <span style={{ color: activeStep === 1 ? PRIMARY_COLOR : '' }} className={activeStep === 1 ? 'text-blue-700' : 'text-gray-500'}>Grupo Familiar</span>
          </div>
          <div className="text-center w-1/3">
            <div className={`w-6 h-6 rounded-full mx-auto mb-1 flex items-center justify-center ${getStepClass(2)}`}>2</div>
            <span style={{ color: activeStep === 2 ? PRIMARY_COLOR : '' }} className={activeStep === 2 ? 'text-blue-700' : 'text-gray-500'}>Forma de Ingreso</span>
          </div>
          <div className="text-center w-1/3">
            <div className={`w-6 h-6 rounded-full mx-auto mb-1 flex items-center justify-center ${getStepClass(3)}`}>3</div>
            <span style={{ color: activeStep === 3 ? PRIMARY_COLOR : '' }} className={activeStep === 3 ? 'text-blue-700' : 'text-gray-500'}>Datos Personales</span>
          </div>
        </div>

        {/* Main Form Content (Using standard HTML form, managing state via React) */}
        <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-4">

          {/* Step 1: Grupo Familiar */}
          {activeStep === 1 && (
            <div className="step-content">
              <h2 className="text-lg font-semibold mb-4 text-gray-700">1. Selecciona tu Grupo Familiar</h2>
              
              {!selectedGroup ? (
                // Show all 4 group buttons when none is selected
                <div className="flex flex-wrap justify-center mb-6 gap-3">
                  <button type="button" className={getButtonClass(1)} onClick={() => selectGroup(1)}>
                    <UserIcon />
                    <span className="text-xs mt-1">Individual</span>
                  </button>
                  <button type="button" className={getButtonClass(3)} onClick={() => selectGroup(3)}>
                    <UsersIcon />
                    <span className="text-xs mt-1">Pareja</span>
                  </button>
                  <button type="button" className={getButtonClass(2)} onClick={() => selectGroup(2)}>
                    <UserPlusIcon />
                    <span className="text-xs mt-1">Titular + Hijos</span>
                  </button>
                  <button type="button" className={getButtonClass(4)} onClick={() => selectGroup(4)}>
                    <UsersPlusIcon />
                    <span className="text-xs mt-1">Pareja + Hijos</span>
                  </button>
                </div>
              ) : (
                // Show selected group button on left and ages on right
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  {/* Selected Group Button */}
                  <div className="flex-shrink-0">
                    <button 
                      type="button" 
                      className={getButtonClass(selectedGroup)} 
                      onClick={() => setSelectedGroup(null)}
                      title="Haz clic para cambiar grupo familiar"
                    >
                      {selectedGroup === 1 && (
                        <>
                          <UserIcon />
                          <span className="text-xs mt-1">Individual</span>
                        </>
                      )}
                      {selectedGroup === 2 && (
                        <>
                          <UserPlusIcon />
                          <span className="text-xs mt-1">Titular + Hijos</span>
                        </>
                      )}
                      {selectedGroup === 3 && (
                        <>
                          <UsersIcon />
                          <span className="text-xs mt-1">Pareja</span>
                        </>
                      )}
                      {selectedGroup === 4 && (
                        <>
                          <UsersPlusIcon />
                          <span className="text-xs mt-1">Pareja + Hijos</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Edades Section */}
                  <div className="flex-1 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="font-bold text-md mb-3 text-gray-700">Edades</h3>
                    
                    {/* Titular Age */}
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm font-medium w-1/3">Titular:</span>
                      <div className="flex-contenedor w-2/3 max-w-[150px]">
                        <button 
                          type="button" 
                          className="btn inner-square-cuatro-div menos" 
                          onMouseDown={() => startContinuousAction(() => decrementar('titular'))}
                          onMouseUp={stopContinuousAction}
                          onMouseLeave={stopContinuousAction}
                          onTouchStart={() => startContinuousAction(() => decrementar('titular'))}
                          onTouchEnd={stopContinuousAction}
                        >-</button>
                        <span className="text-lg font-bold mx-4 w-12 text-center">{edadTitular} años</span>
                        <button 
                          type="button" 
                          className="btn inner-square-cuatro-div mas" 
                          onMouseDown={() => startContinuousAction(() => incrementar('titular'))}
                          onMouseUp={stopContinuousAction}
                          onMouseLeave={stopContinuousAction}
                          onTouchStart={() => startContinuousAction(() => incrementar('titular'))}
                          onTouchEnd={stopContinuousAction}
                        >+</button>
                      </div>
                    </div>

                    {/* Conyuge Age */}
                    {(selectedGroup === 3 || selectedGroup === 4) && (
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm font-medium w-1/3">Pareja:</span>
                        <div className="flex-contenedor w-2/3 max-w-[150px]">
                          <button 
                            type="button" 
                            className="btn inner-square-cuatro-div menos" 
                            onMouseDown={() => startContinuousAction(() => decrementar('conyuge'))}
                            onMouseUp={stopContinuousAction}
                            onMouseLeave={stopContinuousAction}
                            onTouchStart={() => startContinuousAction(() => decrementar('conyuge'))}
                            onTouchEnd={stopContinuousAction}
                          >-</button>
                          <span className="text-lg font-bold mx-4 w-12 text-center">{edadConyuge} años</span>
                          <button 
                            type="button" 
                            className="btn inner-square-cuatro-div mas" 
                            onMouseDown={() => startContinuousAction(() => incrementar('conyuge'))}
                            onMouseUp={stopContinuousAction}
                            onMouseLeave={stopContinuousAction}
                            onTouchStart={() => startContinuousAction(() => incrementar('conyuge'))}
                            onTouchEnd={stopContinuousAction}
                          >+</button>
                        </div>
                      </div>
                    )}

                    {/* Number of Children */}
                    {(selectedGroup === 2 || selectedGroup === 4) && (
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm font-medium w-1/3">Hijos:</span>
                        <div className="flex-contenedor w-2/3 max-w-[150px]">
                          <button 
                            type="button" 
                            className="btn inner-square-cuatro-div menos" 
                            onMouseDown={() => startContinuousAction(() => decrementar('hijos'))}
                            onMouseUp={stopContinuousAction}
                            onMouseLeave={stopContinuousAction}
                            onTouchStart={() => startContinuousAction(() => decrementar('hijos'))}
                            onTouchEnd={stopContinuousAction}
                          >-</button>
                          <span className="text-lg font-bold mx-4 w-12 text-center">{cantidadHijos} hijos</span>
                          <button 
                            type="button" 
                            className="btn inner-square-cuatro-div mas" 
                            onMouseDown={() => startContinuousAction(() => incrementar('hijos'))}
                            onMouseUp={stopContinuousAction}
                            onMouseLeave={stopContinuousAction}
                            onTouchStart={() => startContinuousAction(() => incrementar('hijos'))}
                            onTouchEnd={stopContinuousAction}
                          >+</button>
                        </div>
                      </div>
                    )}

                    {/* Ages of Children (dynamic based on cantidadHijos) */}
                    {cantidadHijos > 0 && (
                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <h4 className="font-semibold text-sm mb-2 text-gray-600">Edades de los Hijos:</h4>
                        {getChildAgeControls.map((i) => (
                          <div key={i} className="flex items-center justify-between py-1">
                            <span className="text-sm w-1/3">Hijo {i + 1}:</span>
                            <div className="flex-contenedor w-2/3 max-w-[150px]">
                              <button 
                                type="button" 
                                className="btn inner-square-cuatro-div menos" 
                                onMouseDown={() => startContinuousAction(() => decrementarChildAge(i))}
                                onMouseUp={stopContinuousAction}
                                onMouseLeave={stopContinuousAction}
                                onTouchStart={() => startContinuousAction(() => decrementarChildAge(i))}
                                onTouchEnd={stopContinuousAction}
                              >-</button>
                              <span className="text-lg font-bold mx-4 w-12 text-center">{(formData as any)[`edadHijo${i + 1}`] || 0}</span>
                              <button 
                                type="button" 
                                className="btn inner-square-cuatro-div mas" 
                                onMouseDown={() => startContinuousAction(() => incrementarChildAge(i))}
                                onMouseUp={stopContinuousAction}
                                onMouseLeave={stopContinuousAction}
                                onTouchStart={() => startContinuousAction(() => incrementarChildAge(i))}
                                onTouchEnd={stopContinuousAction}
                              >+</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={goToNextStep}
                  disabled={!selectedGroup}
                  style={{ backgroundColor: PRIMARY_COLOR }}
                  className="px-6 py-3 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400 transition"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Forma de Ingreso */}
          {activeStep === 2 && (
            <div className="step-content">
              <h2 className="text-lg font-semibold mb-6 text-gray-700">2. Selecciona tu Forma de Ingreso</h2>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button
                  type="button"
                  className={`btn-choice ${aportesType === 'D' ? 'active' : ''}`}
                  onClick={() => selectAportesType('D')}
                >
                  Traspaso de Aportes a Obra Social
                </button>
                <button
                  type="button"
                  className={`btn-choice ${aportesType === 'P' ? 'active' : ''}`}
                  onClick={() => selectAportesType('P')}
                >
                  Solicito Privado
                </button>
              </div>

              {/* Numeric Pad for Sueldo Bruto */}
              {aportesType === 'D' ? (
                <div className="dialog-container mt-6 p-4 bg-gray-50 rounded-lg shadow-inner">
                  <h3 className="text-md font-semibold mb-3 text-gray-700">Ingrese su Sueldo Bruto</h3>
                  <input
                    type="text"
                    value={formattedSueldo ? `$ ${formattedSueldo}` : ''}
                    readOnly
                    placeholder="Sueldo Bruto"
                    className="w-full text-2xl p-3 mb-4 text-right border-b-2 border-gray-300 font-mono focus:border-blue-500"
                  />
                  
                  <div className="numpad grid grid-cols-3 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                      <button key={num} type="button" className="btn-pad" onClick={() => addNumber(num)}>
                        {num}
                      </button>
                    ))}
                    <button type="button" className="btn-pad delete" onClick={deleteNumber}>⌫</button>
                    <button type="button" className="btn-pad" onClick={() => addNumber(0)}>0</button>
                    <button type="button" className="btn-pad listo" onClick={goToNextStep}>Listo</button>
                  </div>
                </div>
              ) : aportesType === 'P' ? (
                <div className="mt-4 p-4 text-center text-gray-600 bg-blue-50 rounded-lg">
                  <p>Pasaremos a la siguiente etapa para completar tus datos personales y generar la cotización privada.</p>
                </div>
              ) : null}

              <div className="flex justify-between mt-6">
                <button type="button" onClick={goToPrevStep} className="px-6 py-3 bg-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-400 transition">
                  Atrás
                </button>
                <button
                  type="button"
                  onClick={goToNextStep}
                  disabled={!aportesType || (aportesType === 'D' && formData.sueldo === 0)}
                  style={{ backgroundColor: PRIMARY_COLOR }}
                  className="px-6 py-3 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400 transition"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Datos Personales & Contacto */}
          {activeStep === 3 && (
            <div className="step-content">
              <h2 className="text-lg font-semibold mb-6 text-gray-700">3. Completa tus Datos Personales</h2>
              
              {!cotizacionVisible ? (
                // Personal Data Form
                <div className="flex flex-col gap-4">
                  <div className="form-group">
                    <label htmlFor="name">Nombre completo</label>
                    <input
                      id="name"
                      type="text"
                      value={formData.personalData.name}
                      onChange={(e) => updatePersonalData('name', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      id="email"
                      type="email"
                      value={formData.personalData.email}
                      onChange={(e) => updatePersonalData('email', e.target.value)}
                      required
                    />
                    {!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.personalData.email) && formData.personalData.email.length > 0 && (
                      <div className="error"><span>Email inválido.</span></div>
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">Celular</label>
                    <input
                      id="phone"
                      type="text"
                      value={formData.personalData.phone}
                      onChange={(e) => updatePersonalData('phone', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="flex justify-between mt-6">
                    <button type="button" onClick={goToPrevStep} className="px-6 py-3 bg-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-400 transition">
                      Atrás
                    </button>
                    <button
                      type="button"
                      onClick={verCotizacion}
                      disabled={!isPersonalDataValid}
                      className="px-6 py-3 bg-green-500 text-white font-bold rounded-lg shadow-md hover:bg-green-600 disabled:bg-gray-400 transition"
                    >
                      Ver Cotización
                    </button>
                  </div>
                </div>
              ) : (
                // Contact Selection or Thank You
                !contactoType ? (
                  // Contact Selection
                  <div className="text-center p-6 bg-yellow-50 rounded-lg mb-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">¡Cotización Generada!</h3>
                    <p className="text-gray-600 mb-6">Estamos listos. ¿Cómo prefieres que continuemos nuestro contacto?</p>

                    <div className="flex justify-center gap-4">
                      <button className="contact-btn" onClick={() => selectContactoType('phone')} type="button">
                        <PhoneIcon className="text-blue-600" />
                        TELÉFONO
                      </button>
                      <button className="contact-btn" onClick={() => selectContactoType('whatsapp')} type="button">
                        <MessageSquareIcon className="text-green-600" />
                        WHATSAPP
                      </button>
                    </div>
                  </div>
                ) : (
                  // Thank You Card
                  <div className="thankyou-card text-center p-8 bg-green-50 rounded-xl shadow-lg">
                    <img className="icon icon--large mx-auto mb-4" src={contactoType === 'phone' ? `https://placehold.co/60x60/${PRIMARY_COLOR.substring(1)}/ffffff?text=CALL` : 'https://placehold.co/60x60/25D366/ffffff?text=WA'} alt="ícono de agradecimiento" />
                    <div className="thankyou-card--title text-2xl font-bold text-gray-800 mb-2">Gracias!</div>
                    <div className="thankyou-card--body text-lg text-gray-600">
                      {contactoType === 'phone' ? (
                        <span>Entraremos en contacto <b>en breve!</b></span>
                      ) : (
                        <span>Estaremos enviandole un mensaje por WhatsApp!</span>
                      )}
                    </div>
                    <div className="mt-4 text-sm text-gray-500 text-left p-3 border-t border-gray-200">
                      <p className='font-bold mb-1'>Datos enviados:</p>
                      <ul className='list-disc list-inside space-y-0.5'>
                        <li>Grupo: {selectedGroup}</li>
                        <li>Titular: {formData.edad_1} años</li>
                        <li>Pareja: {(selectedGroup === 3 || selectedGroup === 4) ? `${formData.edad_2} años` : 'N/A'}</li>
                        <li>Hijos: {formData.numkids}</li>
                        <li>Ingreso: {formData.tipo === 'D' ? `$ ${formattedSueldo} (Aportes)` : 'Privado'}</li>
                        <li>Contacto: {formData.personalData.name} | {formData.personalData.email}</li>
                      </ul>
                    </div>
                  </div>
                )
              )}

              {/* Back button for Step 3, visible only if not finalized */}
              {activeStep === 3 && !contactoType && (
                <div className="flex justify-start mt-6">
                  <button type="button" onClick={goToPrevStep} className="px-6 py-3 bg-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-400 transition">
                    Atrás
                  </button>
                </div>
              )}
            </div>
          )}
        </form>
      </div>
    </>
  );
};

export default FormQuote;
