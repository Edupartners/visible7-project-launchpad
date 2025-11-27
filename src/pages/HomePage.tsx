
import { Dashboard } from "@/components/Dashboard";
import { Footer } from "@/components/layout/Footer";

const HomePage = () => {
  return (
    <>
      <Dashboard 
        userEmail="guest@example.com" 
        onLogout={() => {}} 
        isAuthenticated={false}
      />
      
      <Footer />
    </>
  );
};

export default HomePage;
