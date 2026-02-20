
## Navbar beim Scrollen sichtbar halten

### Problem
Die Navbar hat zwar `sticky top-0`, aber die Home-Seite verwendet `overflow-x-hidden` auf dem aeusseren Container (Zeile 289 in Home.tsx). Das bricht die `sticky`-Positionierung in Browsern -- die Navbar scrollt mit dem Content weg.

### Loesung
Die Navbar von `sticky` auf `fixed` umstellen. Da `fixed` den Platz nicht mehr im Dokumentenfluss reserviert, muss ein Spacer-Element (h-16) unterhalb eingefuegt werden, damit der Seiteninhalt nicht hinter der Navbar verschwindet.

### Aenderungen

**`src/components/Navbar.tsx`** (2 Stellen):
1. Zeile 105: `sticky top-0` aendern zu `fixed top-0`
2. Nach dem schliessenden `</nav>`-Tag: Ein `<div className="h-16" />` Spacer einfuegen, damit der Seiteninhalt korrekt unterhalb der Navbar beginnt

### Ergebnis
- Die Navbar bleibt auf allen Seiten beim Scrollen sichtbar
- Der Seiteninhalt wird nicht von der Navbar verdeckt
- Keine Aenderungen an den einzelnen Seiten-Dateien noetig
