import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import LivePhone from "@/components/LivePhone";
import Marquee from "@/components/Marquee";
import ClimateBand from "@/components/ClimateBand";
import House from "@/components/House";
import Consultation from "@/components/Consultation";
import Faq from "@/components/Faq";
import Footer, { Closing } from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";

export default function Page() {
  return (
    <>
      <SmoothScroll />
      <Nav />
      <main>
        <Hero />
        <LivePhone />
        <Marquee />
        <ClimateBand />
        <House />
        <Consultation />
        <Faq />
        <Closing />
      </main>
      <Footer />
    </>
  );
}
