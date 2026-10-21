import { SidebarLayout } from "@/components/layout/AppSidebar";
import { DashboardJourney } from "@/components/diagnosis/DashboardJourney";

/** Mapa cesty A → D jako samostatný nástroj (přesunuto z nástěnky). */
const JourneyMapPage = () => (
  <SidebarLayout>
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
      <DashboardJourney prominent={false} />
    </main>
  </SidebarLayout>
);

export default JourneyMapPage;
