interface PersonalData {
  name: string;
  email: string;
  phone: string;
  region: string;
  medioContacto: string;
}

// Define la estructura principal del formulario de cotización
export interface QuoteFormData {
  _id: string;
  group: number | null;
  empresa_prepaga: number;
  edad_1: number;
  edad_2: number;
  numkids: number;
  zone_type: string;
  edadHijo1: number; // Max 5 kids supported
  edadHijo2: number;
  edadHijo3: number;
  edadHijo4: number;
  edadHijo5: number;
  tipo: string; // D or P
  agree: boolean;
  aporteOS: number;
  sueldo: number; // Sueldo Bruto
  aporte: number;
  categoriaMono: string;
  monoadic: number;
  cantAport: number;
  afinidad: boolean;
  bonAfinidad: number;
  personalData: PersonalData;
}