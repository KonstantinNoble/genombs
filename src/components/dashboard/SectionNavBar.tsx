import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "section-overview", label: "Overview" },
  { id: "section-positioning", label: "Positioning" },
  { id: "section-offers", label: "Offer & CTAs" },
  { id: "section-trust", label: "Trust & Proof" },
];

interface SectionNavBarProps {
  scrollContainerRef?: React.RefObject<HTMLElement>;
}

const SectionNavBar = ({ scrollContainerRef }: SectionNavBarProps) => {
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id);

  useEffect(() => {
    const root = scrollContainerRef?.current ?? null;
    if (!root) return;

    // Find the viewport element inside ScrollArea (the [data-radix-scroll-area-viewport])
    const viewport = root.querySelector("[data-radix-scroll-area-viewport]") as HTMLElement | null;
    const scrollEl = viewport ?? root;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveSection(visible[0].target.id);
        }
      },
      { root: scrollEl, rootMargin: "-80px 0px -60% 0px", threshold: 0.1 }
    );

    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [scrollContainerRef]);

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
