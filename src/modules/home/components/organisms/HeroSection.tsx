import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 md:py-32 px-4 bg-gradient-hero">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-foreground leading-tight">
              Encontrá el{" "}
              <span className="text-gradient">plan de salud</span>{" "}
              perfecto para vos
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Compará planes de las mejores prepagas de Argentina y elegí el que mejor se adapte a tus necesidades.
            </p>
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 bg-gradient-primary hover:opacity-90 transition-all shadow-colorful hover:shadow-card-hover"
              onClick={() => navigate('/resultados')}
            >
              Cotizar ahora
            </Button>
          </div>
          <div className="relative animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
              <div className="bg-primary/10 p-3 border-b border-border flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive"></div>
                <div className="w-3 h-3 rounded-full bg-warning"></div>
                <div className="w-3 h-3 rounded-full bg-success"></div>
              </div>
              <div className="p-8 space-y-4">
                <div className="h-4 bg-primary/20 rounded-full w-3/4"></div>
                <div className="h-4 bg-secondary/20 rounded-full w-1/2"></div>
                <div className="grid grid-cols-3 gap-4 mt-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-muted p-4 rounded-lg border border-border hover:shadow-card transition-shadow">
                      <div className="h-12 w-12 bg-gradient-primary rounded-lg mb-3 opacity-80"></div>
                      <div className="h-3 bg-primary/10 rounded-full w-full mb-2"></div>
                      <div className="h-3 bg-secondary/10 rounded-full w-2/3"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
