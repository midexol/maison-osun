import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ConsultFlow from "@/components/ConsultFlow";

export const metadata = { title: "Consultation · Maison Osùn" };

export default function Page() {
  return (
    <>
      <Nav />
      <main className="app-main"><ConsultFlow /></main>
      <Footer />
    </>
  );
}
