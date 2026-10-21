import { SidebarLayout } from "@/components/layout/AppSidebar";
import { MarketRentgen } from "@/components/diagnosis/MarketRentgen";

/** Rentgen trhu jako samostatný nástroj v menu. */
const MarketRentgenPage = () => (
  <SidebarLayout>
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-8">
      <MarketRentgen />
    </main>
  </SidebarLayout>
);

export default MarketRentgenPage;
