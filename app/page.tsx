import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CategoryShowcase from "@/components/CategoryShowcase";
import ProductShowcase from "@/components/ProductShowcase";
import EditorialBanner from "@/components/EditorialBanner";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />

      <main>
        <Hero />

        <CategoryShowcase />

        <ProductShowcase />

        <EditorialBanner />
      </main>

      <Footer />
    </>
  );
}