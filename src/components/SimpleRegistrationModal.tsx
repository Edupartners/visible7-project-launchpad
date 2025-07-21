
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle } from "lucide-react";

interface SimpleRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (email: string, name: string) => void;
}

export const SimpleRegistrationModal = ({ 
  isOpen, 
  onClose, 
  onRegister 
}: SimpleRegistrationModalProps) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;
    
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for UX
    onRegister(email, name);
    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-primary-foreground">V7</span>
              </div>
            </div>
            Začněte s VISIBLE7 zdarma
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="vas@email.cz"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name">Jméno</Label>
            <Input
              id="name"
              type="text"
              placeholder="Vaše jméno"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  Fáze 1-3 zdarma navždy
                </p>
                <p className="text-xs text-green-600">
                  Vize • Ideace • Strategie bez poplatků
                </p>
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting || !email || !name}
          >
            {isSubmitting ? "Registruji..." : "Začít zdarma"}
          </Button>
          
          <p className="text-xs text-muted-foreground text-center">
            Registrací souhlasíte s našimi podmínkami použití
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};
