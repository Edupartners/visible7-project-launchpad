
import React from "react";

export const Footer = () => {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center space-y-4">
          <div className="space-y-2">
            <div className="text-sm font-medium text-foreground">
              Máte otázky? Jsme tu pro vás!
            </div>
            <div className="text-sm text-muted-foreground">
              Kontaktujte nás pro více informací na{" "}
              <a 
                href="mailto:michal.micek@edu-patners.cz" 
                className="text-primary hover:underline"
              >
                michal.micek@edu-patners.cz
              </a>
            </div>
          </div>
          
          <div className="border-t pt-4 space-y-2">
            <div className="text-sm font-medium text-foreground">
              © 2025 MICEK™ - Všechna práva vyhrazena
            </div>
            <div className="text-xs text-muted-foreground max-w-2xl mx-auto">
              Toto dílo je chráněno autorským zákonem. Jakékoli neoprávněné užití, 
              kopírování nebo šíření je přísně zakázáno.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
