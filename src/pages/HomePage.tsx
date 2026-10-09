
import { Dashboard } from "@/components/Dashboard";
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

    </>
  );
};

export default HomePage;
