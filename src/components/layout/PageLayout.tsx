import React from "react";
import { SidebarLayout } from "./AppSidebar";
import { BackButton } from "@/components/ui/back-button";
import { Footer } from "./Footer";

interface PageLayoutProps {
  children: React.ReactNode;
  /** Zachováno kvůli kompatibilitě; info o zkušebním přístupu je teď v hlavičce aplikace. */
  showTrialInfo?: boolean;
  onBack?: () => void;
  showBackButton?: boolean;
}

/** Stránky bran: stejná hlavička s menu jako zbytek aplikace. */
export const PageLayout = ({ children, onBack, showBackButton = true }: PageLayoutProps) => {
  return (
    <SidebarLayout>
      <div className="flex min-h-[calc(100vh-4rem)] flex-col">
        {showBackButton && onBack && (
          <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <BackButton onBack={onBack} />
          </div>
        )}
        <main className="flex-1 pb-8">{children}</main>
        <Footer />
      </div>
    </SidebarLayout>
  );
};
