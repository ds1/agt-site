import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import OnboardingContent from "@/components/OnboardingContent";

export const metadata = {
  title: "Configure your .agt name — .agt",
  description:
    "You already own a .agt name. Now give it an agent identity with protocols, capabilities, and endpoints.",
};

export default function OnboardingPage() {
  return (
    <>
      <Nav />
      <OnboardingContent />
      <Footer />
    </>
  );
}
