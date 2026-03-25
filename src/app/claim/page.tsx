import { Suspense } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ClaimContent from "@/components/ClaimContent";

export const metadata = {
  title: "Claim an agent name — .agt",
  description: "Search for and claim a .agt name for your AI agent",
};

export default function ClaimPage() {
  return (
    <>
      <Nav />
      <Suspense>
        <ClaimContent />
      </Suspense>
      <Footer />
    </>
  );
}
