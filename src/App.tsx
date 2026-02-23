import { useEffect } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Stats } from "@/components/landing/Stats";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { SampleProfiles } from "@/components/landing/SampleProfiles";
import { Faq } from "@/components/landing/Faq";
import { Footer } from "@/components/landing/Footer";
import { cn } from "./lib/core/utils";


function App() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.pathname === "/membership") {
      const el = document.getElementById("plans");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, []);

  return (
    <div
      className={cn(
        "min-h-screen",
        "bg-[#FDF2F8]",
        "bg-[url('/assets/landing/Landing-Backgroung.png')]",
        "bg-top",
        "bg-repeat-y",
        "bg-[length:100%_auto]",
        "font-sans",
        "text-gray-900",
        "selection:bg-rose-100",
        "selection:text-rose-900",
      )}
    >
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Features />
        <HowItWorks />
        <SampleProfiles />
        <Faq />
      </main>
      <Footer />
    </div>
  );
}

export default App;
