import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Navbar />
      {/* pt-20 để bù cho fixed header cao 80px */}
      <main className="flex-1 pt-20">
        {children}
      </main>
      <Footer />
    </div>
  );
}
