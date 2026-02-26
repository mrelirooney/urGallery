import Container from "@/components/layout/Container";
import PrivacySection from "@/components/settings/PrivacySection";

export const metadata = {
  title: "Privacy | urGallery",
  description: "urGallery Privacy Policy.",
};

export default function PrivacyPage() {
  return (
    <main className="py-12 md:py-16">
      <Container>
        <h1 className="text-3xl font-bold text-[var(--light-brown)] mb-8">Privacy</h1>
        <PrivacySection />
      </Container>
    </main>
  );
}
