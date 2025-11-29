import { useNavigate } from "react-router-dom";
import { CheckCircle, Search, FileCheck, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const Index = () => {
  const navigate = useNavigate();

  const providers = [
    { name: "OSDE", logo: "/assets/images/card-header/osde.png" },
    { name: "Swiss Medical", logo: "/assets/images/card-header/swissmedical.webp" },
    { name: "Galeno", logo: "/assets/images/card-header/galeno.webp" },
    { name: "Medifé", logo: "/assets/images/card-header/medife.webp" },
    { name: "Omint", logo: "/assets/images/card-header/omint.webp" },
    { name: "Sancor Salud", logo: "/assets/images/card-header/sancorsalud.webp" },
  ];

  const testimonials = [
    {
      name: "María González",
      text: "Encontré el plan perfecto para mi familia en minutos. La comparación fue muy clara y fácil de entender.",
      avatar: "MG"
    },
    {
      name: "Carlos Rodríguez",
      text: "Excelente servicio. Pude comparar todas las opciones sin complicaciones y elegir la mejor prepaga para mí.",
      avatar: "CR"
    },
    {
      name: "Laura Fernández",
      text: "Súper recomendable. Me ayudó a encontrar un plan con mejor cobertura y a un mejor precio.",
      avatar: "LF"
    }
  ];

  const faqs = [
    {
      question: "¿Cómo funciona el comparador de planes?",
      answer: "Nuestro comparador te permite ver todos los planes de salud disponibles, filtrarlos por precio, cobertura y clínicas, y compararlos lado a lado para tomar la mejor decisión."
    },
    {
      question: "¿Es gratis usar el servicio?",
      answer: "Sí, nuestro servicio de comparación es completamente gratuito. No hay cargos ocultos ni comisiones."
    },
    {
      question: "¿Qué prepagas puedo comparar?",
      answer: "Trabajamos con las principales prepagas de Argentina: OSDE, Swiss Medical, Galeno, Medifé, Omint, Sancor Salud, y muchas más."
    },
    {
      question: "¿Puedo cambiar de prepaga en cualquier momento?",
      answer: "Sí, podés cambiar de prepaga cuando lo desees, aunque algunos planes pueden tener períodos de carencia para ciertas prestaciones."
    },
    {
      question: "¿Cómo sé qué plan me conviene?",
      answer: "Podés usar nuestros filtros para comparar precios, coberturas, y clínicas disponibles. También podés ver los beneficios detallados de cada plan."
    },
    {
      question: "¿Los precios están actualizados?",
      answer: "Sí, actualizamos los precios regularmente para asegurarnos de que tengas la información más reciente."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <img 
            src="/src/assets/images/logos/logo-header-tr.png" 
            alt="Logo" 
            className="h-10 hidden md:block"
          />
          <img 
            src="/src/assets/images/logos/logo-header-tr-mobile.png" 
            alt="Logo" 
            className="h-10 md:hidden"
          />
          <Button onClick={() => navigate('/resultados')}>
            Ver Planes
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32 px-4 bg-gradient-to-b from-secondary/30 to-background">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
                Encontrá el plan de salud perfecto para vos
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Compará planes de las mejores prepagas de Argentina y elegí el que mejor se adapte a tus necesidades.
              </p>
              <Button 
                size="lg" 
                className="text-lg px-8 py-6"
                onClick={() => navigate('/resultados')}
              >
                Cotizar ahora
              </Button>
            </div>
            <div className="relative">
              <div className="bg-muted rounded-lg shadow-2xl border border-border overflow-hidden">
                <div className="bg-accent p-3 border-b border-border flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="p-8 space-y-4">
                  <div className="h-4 bg-primary/20 rounded w-3/4"></div>
                  <div className="h-4 bg-primary/10 rounded w-1/2"></div>
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-card p-4 rounded-lg border border-border">
                        <div className="h-12 w-12 bg-primary/20 rounded mb-2"></div>
                        <div className="h-3 bg-muted rounded w-full mb-2"></div>
                        <div className="h-3 bg-muted rounded w-2/3"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">
            ¿Cómo funciona?
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            En solo tres simples pasos podés encontrar el plan ideal
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Search className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>1. Explorá</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Navegá por todos los planes disponibles y filtrá por precio, cobertura y clínicas
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileCheck className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>2. Compará</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Seleccioná hasta 3 planes y comparalos lado a lado para ver diferencias
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Award className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>3. Elegí</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Tomá la mejor decisión con toda la información a tu alcance
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Grid de Logos */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">
            Prepagas destacadas
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            Trabajamos con las mejores prepagas de Argentina
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {providers.map((provider) => (
              <div
                key={provider.name}
                className="bg-background rounded-lg p-6 flex items-center justify-center border border-border hover:shadow-lg transition-shadow"
              >
                <img
                  src={provider.logo}
                  alt={provider.name}
                  className="max-h-12 max-w-full object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">
            Lo que dicen nuestros usuarios
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            Miles de personas ya encontraron su plan ideal
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">"{testimonial.text}"</p>
                  <div className="mt-4 text-yellow-500">★★★★★</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">
            Preguntas frecuentes
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            Respondemos tus dudas sobre planes de salud
          </p>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <img 
                src="/src/assets/images/logos/logo-footer.gif" 
                alt="Logo" 
                className="h-10 mb-4"
              />
              <p className="text-sm opacity-80">
                Tu comparador de confianza para encontrar el mejor plan de salud.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-sm opacity-80">
                <li><a href="#" className="hover:opacity-100">Sobre nosotros</a></li>
                <li><a href="#" className="hover:opacity-100">Contacto</a></li>
                <li><a href="#" className="hover:opacity-100">Trabaja con nosotros</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm opacity-80">
                <li><a href="#" className="hover:opacity-100">Términos y condiciones</a></li>
                <li><a href="#" className="hover:opacity-100">Política de privacidad</a></li>
                <li><a href="#" className="hover:opacity-100">Cookies</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Ayuda</h3>
              <ul className="space-y-2 text-sm opacity-80">
                <li><a href="#" className="hover:opacity-100">Centro de ayuda</a></li>
                <li><a href="#" className="hover:opacity-100">Preguntas frecuentes</a></li>
                <li><a href="#" className="hover:opacity-100">Soporte</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-background/20 pt-8 text-center text-sm opacity-80">
            <p>© {new Date().getFullYear()} Comparador de Planes de Salud. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
