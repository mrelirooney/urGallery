import PortfolioWrapper from "@/components/portfolio/PortfolioWrapper";

export default function PortfolioTestPage() {
  return (
    <main className="w-full bg-neutral-800">
      <PortfolioWrapper >
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Testing Portfolio Wrapper 🧱</h1>
          <p className="text-neutral-400">
            If you can read this, the wrapper is rendering correctly.
          </p>
        </div>
      </PortfolioWrapper>
    </main>
  );
}
