import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import JournalView from "@/components/JournalView";

export const metadata = { title: "Journal · Maison Osùn" };

export default function Page() {
  return (
    <>
      <Nav />
      <main className="app-main"><JournalView /></main>
      <Footer />
    </>
  );
}
