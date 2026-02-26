import Container from "@/components/layout/Container";
import TermsSection from "@/components/settings/TermsSection";

export const metadata = {
  title: "Terms | urGallery",
  description: "urGallery Terms of Service.",
};

export default function TermsPage() {
  return (
    <main className="py-12 md:py-16">
      <Container>
        <h1 className="text-3xl font-bold text-[var(--light-brown)] mb-8">Terms</h1>
        <TermsSection />
      </Container>
    </main>
  );
}
