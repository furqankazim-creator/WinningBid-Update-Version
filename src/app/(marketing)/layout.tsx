import { Nav } from "@/components/marketing/Nav";
import { Footer } from "@/components/marketing/Footer";
import { RevealObserver } from "@/components/marketing/Theme";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream text-ink">
      <Nav />
      <RevealObserver />
      <main key="m">{children}</main>
      <Footer />
    </div>
  );
}
