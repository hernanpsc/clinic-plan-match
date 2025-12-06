
// import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
interface QuoteRequest {
  group: number;
  edad_1: number;
  edad_2: number;
  numkids: number;
  edadHijo1: number;
  edadHijo2: number;
  edadHijo3: number;
  edadHijo4: number;
  edadHijo5: number;
  zone_type: string;
  tipo: string;
  sueldo: number;
  aporteOS: number;
  personalData: {
    name: string;
    email: string;
    phone: string;
    region: string;
    medioContacto: string;
  };
}

Deno.serve(async (req: { method: string; json: () => QuoteRequest | PromiseLike<QuoteRequest>; }) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Submit Quote - Iniciando procesamiento de cotización');

    // Verificar que la URL externa esté configurada (fail-fast)
    const EXTERNAL_QUOTE_URL = Deno.env.get('HEALTH_EXTERNAL_QUOTE_URL');
    if (!EXTERNAL_QUOTE_URL) {
      console.error('ERROR: Variable de entorno HEALTH_EXTERNAL_QUOTE_URL no configurada.');
      return new Response(
        JSON.stringify({ error: 'Configuración de servidor incompleta.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parsear el cuerpo de la solicitud
    const quoteData: QuoteRequest = await req.json();
    console.log('Submit Quote - Datos recibidos:', JSON.stringify(quoteData, null, 2));

    // Validar datos requeridos
    if (!quoteData.personalData?.name || !quoteData.personalData?.email || !quoteData.personalData?.phone) {
      console.error('Submit Quote - Faltan datos personales requeridos');
      return new Response(
        JSON.stringify({ error: 'Faltan datos personales requeridos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Preparar datos para enviar al endpoint externo
    const externalPayload = {
      group: quoteData.group,
      edad_1: quoteData.edad_1,
      edad_2: quoteData.edad_2 || 0,
      numkids: quoteData.numkids || 0,
      edadHijo1: quoteData.edadHijo1 || 0,
      edadHijo2: quoteData.edadHijo2 || 0,
      edadHijo3: quoteData.edadHijo3 || 0,
      edadHijo4: quoteData.edadHijo4 || 0,
      edadHijo5: quoteData.edadHijo5 || 0,
      zone_type: quoteData.zone_type || '',
      tipo: quoteData.tipo,
      sueldo: quoteData.sueldo || 0,
      aporteOS: quoteData.aporteOS || 0,
      personalData: quoteData.personalData,
      timestamp: new Date().toISOString()
    };

    console.log('Submit Quote - Enviando datos al endpoint externo:', EXTERNAL_QUOTE_URL);

    // Hacer la llamada al endpoint externo
    const externalResponse = await fetch(EXTERNAL_QUOTE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(externalPayload),
    });

    if (!externalResponse.ok) {
      const errorText = await externalResponse.text();
      console.error(`Submit Quote - Error del endpoint externo (${externalResponse.status}):`, errorText);
      return new Response(
        JSON.stringify({ 
          error: 'Error al procesar la cotización',
          details: errorText 
        }),
        { 
          status: externalResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const externalData = await externalResponse.json();
    console.log('Submit Quote - Respuesta exitosa del endpoint externo');

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: externalData,
        message: 'Cotización enviada exitosamente' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Submit Quote - Error inesperado:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});