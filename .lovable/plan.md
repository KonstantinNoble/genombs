
# Navbar Redesign – Größer, dynamischer, visueller

## Überblick

Der Header wird größer und prominenter gestaltet mit besserer visueller Hierarchie und einem vollständig überarbeiteten Mobile-Menü.

## Design-Änderungen

### 1. Desktop Header – Größere Elemente

| Element | Aktuell | Neu |
|---------|---------|-----|
| Header-Höhe | `h-16` (64px) | `h-20` (80px) |
| Logo-Icon | `w-9 h-9` | `w-11 h-11` |
| Logo-Text | `text-lg` | `text-xl` |
| Tagline | `text-[10px]` | `text-xs` |
| Nav-Links | `text-sm` | `text-base` |
| CTA-Button | `px-5 py-2` | `px-6 py-2.5` |
| Link-Spacing | `gap-6` | `gap-8` |

### 2. Desktop – Visuelle Verbesserungen

- **Hover-Effekt für Nav-Links**: Subtiler Underline-Effekt bei Hover
- **CTA-Button**: Leichter Scale-Effekt (`hover:scale-105`) + Schatten
- **Active State**: Deutlicherer Indikator für aktive Seite

### 3. Mobile Menu – Komplett überarbeitet

**Aktuell:**
- Einfache Link-Liste
- Standard Button
- Wenig visueller Appeal

**Neu:**
```text
┌─────────────────────────────────────┐
│  ✕  (Schließen-Button rechts oben) │
├─────────────────────────────────────┤
│                                     │
│     [Logo groß zentriert]           │
│                                     │
│     ─────────────────────           │
│                                     │
│         Home                        │
│         Features                    │
│         Pricing                     │
│         Contact                     │
│                                     │
│     ─────────────────────           │
│                                     │
│     [ Get Started → ]  (volle      │
│                         Breite)     │
│                                     │
└─────────────────────────────────────┘
```

- **Fullscreen Overlay**: Das Mobile-Menü nimmt den gesamten Bildschirm ein
- **Zentrierte Navigation**: Alle Links zentriert mit größerem Spacing
- **Größere Touch-Targets**: Minimum 48px Höhe pro Link
- **Animierter Eintritt**: Sanftes Fade-In + Slide-Down
- **Prominenter CTA**: Volle Breite, unten positioniert

### 4. Mobile Menu – Technische Details

```tsx
// Fullscreen Overlay
className="fixed inset-0 z-50 bg-background/98 backdrop-blur-xl"

// Zentrierte Links
className="flex flex-col items-center justify-center gap-6 py-8"

// Größere Links
className="text-2xl font-medium py-3 px-6"

// Volle-Breite CTA
className="w-full mx-4 py-4 text-lg"
```

### 5. Animation für Mobile Menu

- Overlay: `animate-fade-in` (bereits vorhanden)
- Links: Staggered fade-in mit `animation-delay`
- Close-Button: Oben rechts fixiert, größer (`w-8 h-8`)

## Betroffene Datei

`src/components/Navbar.tsx`

## Zusammenfassung der Änderungen

1. **Desktop**: Alles ~25% größer (Header, Logo, Links, Button)
2. **Desktop Hover**: Subtile Underline-Animation für Links
3. **Mobile**: Fullscreen-Overlay statt Dropdown
4. **Mobile Links**: Groß, zentriert, touch-freundlich
5. **Mobile CTA**: Prominent unten, volle Breite
6. **Animationen**: Sanfte Übergänge für professionellen Look
