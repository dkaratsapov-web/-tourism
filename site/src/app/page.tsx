import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { Hero } from "@/components/sections/Hero";
import { FlightStory } from "@/components/story/FlightStory";
import { Formats } from "@/components/sections/Formats";
import { Natalia, Process, Reviews, Lead, Footer } from "@/components/sections/Content";
import { StickyCta } from "@/components/ui/StickyCta";

export default function Home() {
  return (
    <>
      <SmoothScroll />
      <main>
        <Hero />
        <FlightStory />
        <Formats />
        <Natalia />
        <Process />
        <Reviews />
        <Lead />
      </main>
      <Footer />
      <StickyCta />
    </>
  );
}
