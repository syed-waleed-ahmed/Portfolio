import About from "@/components/home/About";
import Contact from "@/components/home/Contact";
import Experience from "@/components/home/Experience";
import Hero from "@/components/home/Hero";
import Work from "@/components/home/Work";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

// The order here is the order of SECTIONS in content/site.ts, which the header
// and the palette read; the content test checks the two agree.
export default function HomePage() {
  return (
    <>
      <Hero />
      <ErrorBoundary>
        <Work />
      </ErrorBoundary>
      <ErrorBoundary>
        <Experience />
      </ErrorBoundary>
      <ErrorBoundary>
        <About />
      </ErrorBoundary>
      <ErrorBoundary>
        <Contact />
      </ErrorBoundary>
    </>
  );
}
