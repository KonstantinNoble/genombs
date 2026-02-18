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
  const allWebsiteSections = BASE_SECTIONS;
  const allCodeSections = [CODE_QUALITY_SECTION];

  const activeSections = [
    ...(hasWebsiteAnalysis ? BASE_SECTIONS : []),
    ...(hasCodeAnalysis ? [CODE_QUALITY_SECTION] : []),
  ];

  const [activeSection, setActiveSection] = useState(activeSections[0]?.id ?? "");

  const updateActive = useCallback(() => {
    if (activeSections.length === 0) return;
    let closest = activeSections[0].id;
    let closestDist = Infinity;

    for (const s of activeSections) {
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

  return (
    <nav className="sticky top-0 z-10 bg-card border-b border-border px-4 py-2">
      <div className="flex gap-1 items-center overflow-x-auto scrollbar-hide">
        {/* Website tabs */}
        {allWebsiteSections.map((section) => {
          const isDisabled = !hasWebsiteAnalysis;
          return (
            <button
              key={section.id}
              onClick={() => !isDisabled && scrollTo(section.id)}
              disabled={isDisabled}
              className={`whitespace-nowrap px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                isDisabled
                  ? "opacity-40 cursor-default text-muted-foreground"
                  : activeSection === section.id
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {section.label}
            </button>
          );
        })}

        {/* Vertical divider */}
        <div className="w-px h-4 bg-border mx-1 shrink-0" />

        {/* Code tab */}
        {allCodeSections.map((section) => {
          const isDisabled = !hasCodeAnalysis;
          return (
            <button
              key={section.id}
              onClick={() => !isDisabled && scrollTo(section.id)}
              disabled={isDisabled}
              className={`whitespace-nowrap px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                isDisabled
                  ? "opacity-40 cursor-default text-muted-foreground"
                  : activeSection === section.id
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {section.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export { BASE_SECTIONS as SECTIONS };
export default SectionNavBar;
