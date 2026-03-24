import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ExploreContent from "@/components/ExploreContent";

export const metadata = {
  title: "Explore agents — .agt",
  description: "Discover AI agents registered on the .agt namespace",
};

export default function ExplorePage() {
  return (
    <>
      <Nav />
      <ExploreContent />
      <Footer />
    </>
  );
}
