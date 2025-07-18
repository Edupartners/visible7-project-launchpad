
import React from "react";
import { UnifiedHeader } from "./UnifiedHeader";
import { BackButton } from "@/components/ui/back-button";

interface PageLayoutProps {
  children: React.ReactNode;
  showTrialInfo?: boolean;
  onBack?: () => void;
  showBackButton?: boolean;
}

export const PageLayout = ({ 
  children, 
  showTrialInfo = true, 
  onBack,
  showBackButton = true 
}: PageLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5">
      <UnifiedHeader showTrialInfo={showTrialInfo} />
      
      {showBackButton && onBack && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <BackButton onBack={onBack} />
        </div>
      )}
      
      <main className="pb-8">
        {children}
      </main>
    </div>
  );
};
