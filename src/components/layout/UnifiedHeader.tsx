
import React from "react";
import { useNavigate } from "react-router-dom";

interface UnifiedHeaderProps {
  showTrialInfo?: boolean;
}

export const UnifiedHeader = ({ showTrialInfo = true }: UnifiedHeaderProps) => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/home');
  };

  return (
    <header className="w-full bg-gradient-to-r from-background via-primary/5 to-accent/10 border-b border-border/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div 
              className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleLogoClick}
            >
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-sm font-bold text-primary-foreground">V7</span>
              </div>
              <span className="text-xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                VISIBLE7 MICEK™
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
