export interface WebsiteProfile {
  id: string;
  url: string;
  isOwnWebsite: boolean;
  profileData: {
    name: string;
    targetAudience: string;
    usp: string;
    ctas: string[];
    siteStructure: string[];
    strengths: string[];
    weaknesses: string[];
  };
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface ChatConversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
}

export interface ImprovementTask {
  id: string;
  websiteProfileId: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  createdAt: string;
}

export const mockWebsiteProfiles: WebsiteProfile[] = [
  {
    id: "wp-1",
    url: "https://mein-handwerk.de",
    isOwnWebsite: true,
    profileData: {
      name: "Mein Handwerk",
      targetAudience: "Hausbesitzer und Mieter in der Region München, die Renovierungs- oder Reparaturarbeiten benötigen. Alter 30–60, mittleres bis hohes Einkommen.",
      usp: "Meisterbetrieb mit 20 Jahren Erfahrung, kostenlose Erstberatung, Festpreisgarantie.",
      ctas: ["Jetzt Angebot anfordern", "Kostenlose Beratung buchen"],
      siteStructure: ["Startseite", "Leistungen", "Über uns", "Referenzen", "Kontakt"],
      strengths: [
        "Klare Positionierung als regionaler Meisterbetrieb",
        "Vertrauenselemente: Bewertungen, Zertifikate",
        "Festpreisgarantie als Differenzierungsmerkmal",
      ],
      weaknesses: [
        "Keine Online-Terminbuchung",
        "Keine Fallstudien oder Vorher/Nachher-Bilder",
        "Mobile Version langsam und unübersichtlich",
        "Kein Blog oder Ratgeber-Content",
      ],
    },
    createdAt: "2026-02-08T10:00:00Z",
  },
  {
    id: "wp-2",
    url: "https://schnell-reparatur.de",
    isOwnWebsite: false,
    profileData: {
      name: "Schnell Reparatur",
      targetAudience: "Eilige Kunden mit akuten Reparaturproblemen (Rohrbruch, Heizungsausfall). Breites Altersspektrum, lokaler Fokus.",
      usp: "24/7 Notdienst, Anfahrt in 30 Minuten, transparente Preise.",
      ctas: ["Notdienst rufen", "WhatsApp-Kontakt"],
      siteStructure: ["Home", "Notdienst", "Preise", "Bewertungen", "Kontakt"],
      strengths: [
        "Starke Notdienst-Positionierung",
        "WhatsApp-Integration für schnellen Kontakt",
        "Prominente Google-Bewertungen",
      ],
      weaknesses: [
        "Kein Angebot für geplante Renovierungen",
        "Website wirkt unseriös durch zu viele Farben",
        "Keine Zertifikate oder Qualifikationen sichtbar",
      ],
    },
    createdAt: "2026-02-08T10:30:00Z",
  },
  {
    id: "wp-3",
    url: "https://bau-meister-mueller.de",
    isOwnWebsite: false,
    profileData: {
      name: "Baumeister Müller",
      targetAudience: "Bauherren und Architekten für Neubauten und größere Umbauten. Gewerblich und privat.",
      usp: "Komplettservice von Planung bis Fertigstellung, BIM-Planung, energieeffizientes Bauen.",
      ctas: ["Projekt anfragen", "Referenzen ansehen"],
      siteStructure: ["Start", "Leistungen", "Projekte", "Team", "Nachhaltigkeit", "Kontakt"],
      strengths: [
        "Professioneller Webauftritt",
        "Beeindruckende Projektgalerie",
        "Nachhaltigkeits-Positionierung",
        "Umfangreiche Teamvorstellung",
      ],
      weaknesses: [
        "Lange Ladezeiten durch große Bilder",
        "Keine Preistransparenz",
        "Kontaktformular zu komplex",
      ],
    },
    createdAt: "2026-02-09T14:00:00Z",
  },
];

export const mockConversations: ChatConversation[] = [
  {
    id: "conv-1",
    title: "Website-Analyse: Mein Handwerk",
    createdAt: "2026-02-08T10:00:00Z",
    messages: [
      {
        id: "msg-1",
        role: "user",
        content: "Analysiere bitte meine Website https://mein-handwerk.de",
        createdAt: "2026-02-08T10:00:00Z",
      },
      {
        id: "msg-2",
        role: "assistant",
        content: `Ich habe **mein-handwerk.de** analysiert und ein strukturiertes Profil erstellt.

## Zusammenfassung

**Zielgruppe:** Hausbesitzer und Mieter in der Region München (30–60 Jahre), die Renovierungs- oder Reparaturarbeiten benötigen.

**Nutzenversprechen:** Meisterbetrieb mit 20 Jahren Erfahrung, kostenlose Erstberatung, Festpreisgarantie.

## Stärken
- Klare Positionierung als regionaler Meisterbetrieb
- Vertrauenselemente wie Bewertungen und Zertifikate
- Festpreisgarantie als Differenzierungsmerkmal

## Schwächen
- **Keine Online-Terminbuchung** — Kunden müssen anrufen
- **Keine Fallstudien** oder Vorher/Nachher-Bilder
- **Mobile Version** langsam und unübersichtlich
- **Kein Content-Marketing** (Blog/Ratgeber)

Soll ich einen Verbesserungsplan erstellen oder mit einem Konkurrenten vergleichen?`,
        createdAt: "2026-02-08T10:01:00Z",
      },
      {
        id: "msg-3",
        role: "user",
        content: "Vergleiche mich mit https://schnell-reparatur.de — was machen die besser?",
        createdAt: "2026-02-08T10:05:00Z",
      },
      {
        id: "msg-4",
        role: "assistant",
        content: `Ich habe **schnell-reparatur.de** analysiert. Hier der Vergleich:

## Was Schnell Reparatur besser macht

| Kriterium | Mein Handwerk | Schnell Reparatur |
|-----------|--------------|-------------------|
| Kontaktweg | Nur Telefon & Formular | **WhatsApp + Telefon** |
| Erreichbarkeit | Geschäftszeiten | **24/7 Notdienst** |
| Bewertungen | Vorhanden, aber versteckt | **Prominent auf Startseite** |
| Reaktionszeit | Nicht kommuniziert | **"30 Min Anfahrt" versprochen** |

## Was du besser machst

- **Festpreisgarantie** — Schnell Reparatur hat keine Preisgarantie
- **Meister-Qualifikation** sichtbar — beim Konkurrenten fehlen Zertifikate
- **Breiteres Angebot** — nicht nur Notfälle, sondern auch Renovierung

## Empfehlung
Übernimm die **WhatsApp-Integration** und mache deine **Bewertungen prominenter**. Deine Festpreisgarantie ist ein starkes Alleinstellungsmerkmal — hebe das noch deutlicher hervor.`,
        createdAt: "2026-02-08T10:06:00Z",
      },
    ],
  },
  {
    id: "conv-2",
    title: "Verbesserungsplan Mobile",
    createdAt: "2026-02-09T14:00:00Z",
    messages: [
      {
        id: "msg-5",
        role: "user",
        content: "Erstelle mir einen konkreten Plan, um meine mobile Website zu verbessern.",
        createdAt: "2026-02-09T14:00:00Z",
      },
      {
        id: "msg-6",
        role: "assistant",
        content: `Hier ist dein **Mobile-Optimierungsplan** basierend auf der Analyse von mein-handwerk.de:

## Phase 1: Quick Wins (diese Woche)
1. **Bilder komprimieren** — Aktuelle Bilder sind unkomprimiert (3-5 MB). Ziel: unter 200 KB pro Bild
2. **Click-to-Call Button** — Große, gut sichtbare Telefon-Schaltfläche im Header
3. **Menü vereinfachen** — Maximal 5 Hauptpunkte im mobilen Menü

## Phase 2: Strukturelle Verbesserungen (nächste 2 Wochen)
4. **Online-Terminbuchung** integrieren (z.B. Calendly oder eigenes Formular)
5. **WhatsApp-Button** als floating Action-Button
6. **Bewertungen** direkt auf der Startseite einbinden

## Phase 3: Content (laufend)
7. **Vorher/Nachher-Galerie** für abgeschlossene Projekte
8. **Ratgeber-Blog** starten (SEO + Vertrauensaufbau)

Soll ich daraus Aufgaben für dein Dashboard erstellen?`,
        createdAt: "2026-02-09T14:01:00Z",
      },
    ],
  },
];

export const mockTasks: ImprovementTask[] = [
  {
    id: "task-1",
    websiteProfileId: "wp-1",
    title: "Bilder komprimieren",
    description: "Alle Website-Bilder auf unter 200 KB komprimieren. Tools: TinyPNG, Squoosh.",
    status: "done",
    priority: "high",
    createdAt: "2026-02-09T14:02:00Z",
  },
  {
    id: "task-2",
    websiteProfileId: "wp-1",
    title: "Click-to-Call Button einbauen",
    description: "Großen, gut sichtbaren Telefon-Button im mobilen Header platzieren.",
    status: "in_progress",
    priority: "high",
    createdAt: "2026-02-09T14:02:00Z",
  },
  {
    id: "task-3",
    websiteProfileId: "wp-1",
    title: "WhatsApp-Button integrieren",
    description: "Floating WhatsApp-Button auf allen Seiten einbauen für schnellen Kontakt.",
    status: "todo",
    priority: "medium",
    createdAt: "2026-02-09T14:02:00Z",
  },
  {
    id: "task-4",
    websiteProfileId: "wp-1",
    title: "Online-Terminbuchung einrichten",
    description: "Calendly oder eigenes Buchungsformular integrieren.",
    status: "todo",
    priority: "medium",
    createdAt: "2026-02-09T14:02:00Z",
  },
  {
    id: "task-5",
    websiteProfileId: "wp-1",
    title: "Vorher/Nachher-Galerie erstellen",
    description: "Bildergalerie mit abgeschlossenen Projekten als Referenz anlegen.",
    status: "todo",
    priority: "low",
    createdAt: "2026-02-09T14:02:00Z",
  },
];
