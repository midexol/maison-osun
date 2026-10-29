import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Reading from "@/components/Reading";
import Statement from "@/components/Statement";
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
        <Reading />
        <Statement />
        <House />
        <Consultation />
        <Faq />
        <Closing />
      </main>
      <Footer />
    </>
  );
}
