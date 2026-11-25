import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { RevealObserver } from "@/components/motion/RevealObserver";
import { Header } from "@/components/ui/Header";
import { Hero } from "@/components/sections/Hero";
import { FlightStory } from "@/components/story/FlightStory";
import { Marquee } from "@/components/ui/Marquee";
import { DepartureBoard, Formats } from "@/components/sections/Formats";
import { Natalia } from "@/components/sections/Natalia";
import { TurkishTiles } from "@/components/sections/TurkishTiles";
import { HotelReviews, Letters } from "@/components/sections/Reviews";
import { Process } from "@/components/sections/Process";
import { Lead, LeadDialog } from "@/components/sections/Lead";
import { Footer } from "@/components/sections/Footer";
import { SectionIndex } from "@/components/ui/SectionIndex";
import { ScrollHint } from "@/components/ui/ScrollHint";
import { StickyCta } from "@/components/ui/StickyCta";

const PLACES = ["Анталия", "Каппадокия", "Бодрум", "Стамбул", "Эгейское побережье"];

export default function Home() {
  return (
    <>
      <SmoothScroll />
      <RevealObserver />
      <Header />
      <SectionIndex />
      <main id="main">
        <Hero />
        <FlightStory />
        <Marquee items={PLACES} className="display border-y border-[var(--ink)]/12 bg-[var(--paper)] py-5 text-[clamp(3.6rem,10vw,10rem)] leading-[1.05] md:py-8" />
        <DepartureBoard />
        <Formats />
        <TurkishTiles />
        <Natalia />
        <HotelReviews />
        <Process />
        <Letters />
        <Marquee
          items={PLACES}
          dir={-1}
          starClass="text-[var(--ink)]"
          className="display bg-[var(--sky)] py-3 text-[clamp(2.4rem,5vw,4.8rem)] leading-[1.1] md:py-4"
        />
        <Lead />
      </main>
      <Footer />
      <StickyCta />
      <ScrollHint />
      <LeadDialog />
    </>
  );
}
