import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <a href="/" className="flex items-center">
          <img 
            src="/assets/images/logos/logo-header-tr.png" 
            alt="Mejor Plan - Consultores en Salud" 
            className="h-10 hidden md:block"
          />
          <img 
            src="/assets/images/logos/logo-header-tr-mobile.png" 
            alt="Mejor Plan - Consultores en Salud" 
            className="h-10 md:hidden"
          />
        </a>
        <Button onClick={() => navigate('/resultados')} className="shadow-sm">
          Ver Planes
        </Button>
      </div>
    </header>
  );
};

export default Header;
