import { useEffect, useState, useCallback } from "react";

const BASE_SECTIONS = [
  { id: "section-overview", label: "Overview" },
  { id: "section-positioning", label: "Positioning" },
  { id: "section-offers", label: "Offer & CTAs" },
  { id: "section-trust", label: "Trust & Proof" },
];

const CODE_QUALITY_SECTION = { id: "section-code-quality", label: "Code Quality" };

interface SectionNavBarProps {
  hasCodeAnalysis?: boolean;
  hasWebsiteAnalysis?: boolean;
}

const SectionNavBar = ({ hasCodeAnalysis = false, hasWebsiteAnalysis = true }: SectionNavBarProps) => {
  const websiteSections = hasWebsiteAnalysis ? BASE_SECTIONS : [];
  const codeSections = hasCodeAnalysis ? [CODE_QUALITY_SECTION] : [];
  const sections = [...websiteSections, ...codeSections];

  const [activeSection, setActiveSection] = useState(sections[0]?.id ?? "");

  const updateActive = useCallback(() => {
    if (sections.length === 0) return;
    let closest = sections[0].id;
    let closestDist = Infinity;

    for (const s of sections) {
      const el = document.getElementById(s.id);
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      const dist = Math.abs(rect.top - 120);
      if (rect.top <= 200 && dist < closestDist) {
        closestDist = dist;
        closest = s.id;
      }
    }

    setActiveSection(closest);
  }, [hasCodeAnalysis, hasWebsiteAnalysis]);

  useEffect(() => {
    const handleScroll = () => {
      requestAnimationFrame(updateActive);
    };

    const viewports = document.querySelectorAll("[data-radix-scroll-area-viewport]");
    const scrollEls: Element[] = [];

    viewports.forEach((vp) => {
      if (vp.querySelector("#section-overview") || vp.querySelector("#section-code-quality")) {
        scrollEls.push(vp);
        vp.addEventListener("scroll", handleScroll, { passive: true });
      }
    });

    window.addEventListener("scroll", handleScroll, { passive: true });
    updateActive();

    return () => {
      scrollEls.forEach((el) => el.removeEventListener("scroll", handleScroll));
      window.removeEventListener("scroll", handleScroll);
    };
  }, [updateActive]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (sections.length === 0) return null;

  return (
    <nav className="sticky top-0 z-10 bg-card border-b border-border px-4 py-2">
      <div className="flex gap-1 overflow-x-auto scrollbar-hide">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => scrollTo(section.id)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
              activeSection === section.id
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>
    </nav>
  );
};

export { BASE_SECTIONS as SECTIONS };
export default SectionNavBar;
