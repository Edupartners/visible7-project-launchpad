
import { UnifiedHeader } from "@/components/layout/UnifiedHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";

const UserProfilePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <UnifiedHeader />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Profil uživatele</h1>
          <p className="text-muted-foreground">Správa vašich osobních údajů</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profil
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Profil je dostupný po přihlášení.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserProfilePage;
