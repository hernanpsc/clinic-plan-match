const Footer = () => {
  return (
    <footer className="bg-footer text-footer-foreground py-12 px-4">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <img 
              src="/assets/images/logos/logo-footer.gif" 
              alt="Mejor Plan - Consultores en Salud" 
              className="h-10 mb-4"
            />
            <p className="text-sm opacity-80">
              Tu comparador de confianza para encontrar el mejor plan de salud en Argentina.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Empresa</h3>
            <ul className="space-y-2 text-sm opacity-80">
              <li><a href="#" className="hover:opacity-100 transition-opacity">Sobre nosotros</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">Contacto</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">Trabaja con nosotros</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm opacity-80">
              <li><a href="#" className="hover:opacity-100 transition-opacity">Términos y condiciones</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">Política de privacidad</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">Cookies</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Ayuda</h3>
            <ul className="space-y-2 text-sm opacity-80">
              <li><a href="#" className="hover:opacity-100 transition-opacity">Centro de ayuda</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">Preguntas frecuentes</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">Soporte</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-footer-foreground/20 pt-8 text-center text-sm opacity-80">
          <p>© {new Date().getFullYear()} Mejor Plan - Consultores en Salud. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
