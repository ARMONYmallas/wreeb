import { Header } from '@/components/site/Header';
import { Footer } from '@/components/site/Footer';
import { MobileActionBar } from '@/components/site/MobileActionBar';
import { WhatsAppFab } from '@/components/site/WhatsAppButton';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main id="contenido" className="flex-1">
        {children}
      </main>
      <div className="pb-mobile-bar">
        <Footer />
      </div>
      <MobileActionBar />
      <WhatsAppFab />
    </div>
  );
}
