import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PortraitView from "@/components/PortraitView";

export const metadata = { title: "Your portrait · Maison Osùn" };

export default function Page() {
  return (
    <>
      <Nav />
      <main className="app-main"><PortraitView /></main>
      <Footer />
    </>
  );
}
