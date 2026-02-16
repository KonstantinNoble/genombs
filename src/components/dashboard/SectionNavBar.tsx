import { useEffect, useState, useCallback } from "react";

const SECTIONS = [
  { id: "section-overview", label: "Overview" },
  { id: "section-positioning", label: "Positioning" },
  { id: "section-offers", label: "Offer & CTAs" },
  { id: "section-trust", label: "Trust & Proof" },
];

const SectionNavBar = () => {
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id);

  const updateActive = useCallback(() => {
    // Find the closest section to the top of the viewport
    let closest = SECTIONS[0].id;
    let closestDist = Infinity;

    for (const s of SECTIONS) {
      const el = document.getElementById(s.id);
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      // We want the section whose top is closest to (but not far below) the top
      const dist = Math.abs(rect.top - 120);
      if (rect.top <= 200 && dist < closestDist) {
        closestDist = dist;
        closest = s.id;
      }
    }

    setActiveSection(closest);
  }, []);

  useEffect(() => {
    // Listen on all possible scroll containers
    const handleScroll = () => {
      requestAnimationFrame(updateActive);
    };

    // Find the ScrollArea viewport(s) in the dashboard panel
    const viewports = document.querySelectorAll("[data-radix-scroll-area-viewport]");
    const scrollEls: Element[] = [];

    viewports.forEach((vp) => {
      // Only attach to viewports that contain our sections
      if (vp.querySelector("#section-overview")) {
        scrollEls.push(vp);
        vp.addEventListener("scroll", handleScroll, { passive: true });
      }
    });

    // Also listen on window as fallback
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Initial check
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
      <div className="flex gap-1 overflow-x-auto scrollbar-hide">
        {SECTIONS.map((section) => (
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

export { SECTIONS };
export default SectionNavBar;
