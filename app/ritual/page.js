import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import RitualView from "@/components/RitualView";

export const metadata = { title: "Your ritual · Maison Osùn" };

export default function Page() {
  return (
    <>
      <Nav />
      <main className="app-main"><RitualView /></main>
      <Footer />
    </>
  );
}
