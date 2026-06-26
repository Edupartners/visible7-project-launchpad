
import { Dashboard } from "@/components/Dashboard";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/components/AuthGate";

const HomePage = () => {
  const { user, signOut } = useAuth();

  return (
    <>
      <Dashboard
        userEmail={user?.email ?? ""}
        onLogout={signOut}
        isAuthenticated={!!user}
      />

      <Footer />
    </>
  );
};

export default HomePage;
