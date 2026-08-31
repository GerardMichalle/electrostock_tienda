import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import CategoryGrid from "@/components/CategoryGrid";
import NovedadesGrid from "@/components/NovedadesGrid";
import SoftwareCarousel from "@/components/SoftwareCarousel";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />

        <section id="categorias" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <h2 className="font-display text-2xl font-semibold">
            Categorías principales
          </h2>
          <CategoryGrid />
        </section>

        <section id="novedades" className="border-t border-border bg-surface">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
            <NovedadesGrid />
          </div>
        </section>

        <section id="software" className="border-t border-border">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
            <h2 className="font-display text-2xl font-semibold">
              Software 
            </h2>
            <p className="mt-2 max-w-xl text-sm text-text-muted">
              Los programas que todo ingeniero electrónico usa para diseñar,
              simular y documentar.
            </p>
            <div className="mt-6">
              <SoftwareCarousel />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
