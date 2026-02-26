import Container from "@/components/layout/Container";
import HelpPageClient from "./HelpPageClient";

export const metadata = {
  title: "Help | urGallery",
  description: "Get help or send feedback to urGallery.",
};

export default function HelpPage() {
  return (
    <main className="py-12 md:py-16">
      <Container>
        <h1 className="text-3xl font-bold text-[var(--light-brown)] mb-8">Help</h1>
        <HelpPageClient />
      </Container>
    </main>
  );
}
