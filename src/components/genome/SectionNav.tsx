import { useEffect, useState } from "react";

interface Section {
  id: string;
  label: string;
}

interface SectionNavProps {
  sections: Section[];
}

const SectionNav = ({ sections }: SectionNavProps) => {
  const [activeSection, setActiveSection] = useState(sections[0]?.id || "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveSection(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0.1 }
    );

    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <nav className="sticky top-16 z-30 bg-background/95 backdrop-blur-sm border-b border-border -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 mb-6">
      <div className="flex gap-1 overflow-x-auto py-3 scrollbar-hide">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => scrollTo(section.id)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-md text-base font-medium transition-colors ${
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

export default SectionNav;
