import Container from "@/components/layout/Container";
import AboutSection from "@/components/settings/AboutSection";

export const metadata = {
  title: "About | urGallery",
  description: "urGallery is a portfolio builder made for artists and creators.",
};

export default function AboutPage() {
  return (
    <main className="py-12 md:py-16">
      <Container>
        <h1 className="text-3xl font-bold text-[var(--light-brown)] mb-8">About</h1>
        <AboutSection />
      </Container>
    </main>
  );
}
