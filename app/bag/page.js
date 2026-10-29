import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import BagView from "@/components/BagView";

export const metadata = { title: "Bag · Maison Osùn" };

export default function Page() {
  return (
    <>
      <Nav />
      <main className="app-main"><BagView /></main>
      <Footer />
    </>
  );
}
