
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { UnifiedHeader } from "@/components/layout/UnifiedHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Building, Phone, Globe, Calendar, Clock } from "lucide-react";
import { useTrial } from "@/hooks/useTrial";
import { MotivationalBox } from "@/components/profile/MotivationalBox";

const UserProfilePage = () => {
  const { userProfile, updateProfile } = useAuth();
  const { toast } = useToast();
  const { daysRemaining, isActive } = useTrial();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: userProfile?.firstName || userProfile?.name?.split(' ')[0] || '',
    lastName: userProfile?.lastName || userProfile?.name?.split(' ').slice(1).join(' ') || '',
    company: userProfile?.company || '',
    position: userProfile?.position || '',
    phone: userProfile?.phone || '',
    website: userProfile?.website || '',
    bio: userProfile?.bio || '',
  });

  const handleSave = () => {
    const fullName = `${formData.firstName} ${formData.lastName}`.trim();
    updateProfile({
      ...formData,
      name: fullName,
    });
    setIsEditing(false);
    toast({
      title: "Profil aktualizován",
      description: "Vaše změny byly úspěšně uloženy.",
    });
  };

  const handleCancel = () => {
    setFormData({
      firstName: userProfile?.firstName || userProfile?.name?.split(' ')[0] || '',
      lastName: userProfile?.lastName || userProfile?.name?.split(' ').slice(1).join(' ') || '',
      company: userProfile?.company || '',
      position: userProfile?.position || '',
      phone: userProfile?.phone || '',
      website: userProfile?.website || '',
      bio: userProfile?.bio || '',
    });
    setIsEditing(false);
  };

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getFullName = () => {
    return `${formData.firstName} ${formData.lastName}`.trim() || userProfile?.name || '';
  };

  const getDaysUsed = () => {
    if (!userProfile?.createdAt) return 0;
    const created = new Date(userProfile.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
        <UnifiedHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-muted-foreground">Profil nenalezen</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <UnifiedHeader />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Profil uživatele</h1>
          <p className="text-muted-foreground">Správa vašich osobních údajů a informací</p>
        </div>

        {/* Motivational Box */}
        <div className="mb-8">
          <MotivationalBox
            userName={getFullName() || userProfile.email.split('@')[0]}
            daysUsed={getDaysUsed()}
            completedPhases={2}
            totalPhases={6}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <Avatar className="w-20 h-20 mx-auto mb-4">
                  <AvatarFallback className="text-lg bg-gradient-to-br from-primary/20 to-accent/20 text-primary">
                    {getUserInitials(getFullName() || userProfile.email)}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl">{getFullName() || userProfile.email.split('@')[0]}</CardTitle>
                <p className="text-sm text-muted-foreground">{userProfile.email}</p>
                
                <div className="flex justify-center mt-4">
                  <Badge variant={isActive ? "default" : "destructive"}>
                    {isActive ? `Trial: ${daysRemaining} dní` : 'Trial ukončen'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Registrace: {new Date(userProfile.createdAt).toLocaleDateString('cs-CZ')}</span>
                  </div>
                  {userProfile.lastLogin && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>Poslední přihlášení: {new Date(userProfile.lastLogin).toLocaleDateString('cs-CZ')}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Profile Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Osobní údaje</CardTitle>
                  <div className="space-x-2">
                    {!isEditing ? (
                      <Button onClick={() => setIsEditing(true)}>
                        Upravit
                      </Button>
                    ) : (
                      <>
                        <Button variant="outline" onClick={handleCancel}>
                          Zrušit
                        </Button>
                        <Button onClick={handleSave}>
                          Uložit
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Jméno *
                    </Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="lastName">Příjmení *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    value={userProfile.email}
                    disabled
                    className="mt-1 bg-muted"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company" className="flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      Společnost
                    </Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="position">Pozice</Label>
                    <Input
                      id="position"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Telefon
                    </Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="website" className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Webová stránka
                    </Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                </div>

                <Separator />

                <div>
                  <Label htmlFor="bio">O mně</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    disabled={!isEditing}
                    className="mt-1"
                    rows={4}
                    placeholder="Napište něco o sobě..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
