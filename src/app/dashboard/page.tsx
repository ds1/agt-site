import { Suspense } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import DashboardContent from "@/components/DashboardContent";

export const metadata = {
  title: "Dashboard — .agt",
  description: "Manage your .agt agent configuration",
};

export default function DashboardPage() {
  return (
    <>
      <Nav />
      <Suspense>
        <DashboardContent />
      </Suspense>
      <Footer />
    </>
  );
}
