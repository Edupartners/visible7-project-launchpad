import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  onBack: () => void;
  className?: string;
}

export function BackButton({ onBack, className = "" }: BackButtonProps) {
  return (
    <Button
      onClick={onBack}
      variant="ghost"
      size="sm"
      className={`text-muted-foreground hover:text-foreground ${className}`}
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      Zpět na přehled
    </Button>
  );
}