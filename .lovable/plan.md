
## Fix: "Invalid regular expression" Crash auf Mobile

### Ursache

Die Bibliothek `remark-gfm` (importiert in `src/components/chat/ChatMessage.tsx`, Zeile 3) verwendet intern Named Capture Groups in regulaeren Ausdruecken. Aeltere mobile Browser (iOS Safari vor Version 16.4, aeltere Android WebViews) unterstuetzen diese Syntax nicht und werfen beim Laden des Moduls sofort den Fehler:

> "Invalid regular expression: Invalid group specifier name"

Da der Fehler beim Modul-Import passiert (nicht beim Rendern), crasht die gesamte Chat-Seite bevor sie ueberhaupt angezeigt wird.

### Loesung

`remark-gfm` wird **dynamisch und fehlertolerant** geladen. Wenn der Import fehlschlaegt (auf alten Browsern), wird Markdown einfach ohne GFM-Erweiterungen (Tabellen, Strikethrough, etc.) gerendert -- die Seite crasht nicht mehr.

### Aenderung: `src/components/chat/ChatMessage.tsx`

```typescript
import { useState, useEffect } from "react";
import type { Message } from "@/types/chat";
import ReactMarkdown from "react-markdown";

// Dynamisch laden, da remark-gfm auf alten mobilen Browsern crasht
// (Named Capture Groups in Regex werden nicht unterstuetzt)
let remarkGfmPlugin: any = null;
let pluginLoadAttempted = false;

const loadRemarkGfm = async () => {
  if (pluginLoadAttempted) return;
  pluginLoadAttempted = true;
  try {
    const mod = await import("remark-gfm");
    remarkGfmPlugin = mod.default;
  } catch (e) {
    console.warn("remark-gfm not supported on this browser:", e);
  }
};

const ChatMessage = ({ message }: ChatMessageProps) => {
  const [pluginReady, setPluginReady] = useState(!!remarkGfmPlugin);

  useEffect(() => {
    if (!remarkGfmPlugin && !pluginLoadAttempted) {
      loadRemarkGfm().then(() => setPluginReady(!!remarkGfmPlugin));
    }
  }, []);

  const plugins = remarkGfmPlugin ? [remarkGfmPlugin] : [];

  // ... rest bleibt gleich, nur remarkPlugins={plugins} statt remarkPlugins={[remarkGfm]}
};
```

### Was sich aendert

- **Alte Mobile-Browser**: Markdown wird ohne Tabellen/Strikethrough gerendert, aber die Seite funktioniert
- **Moderne Browser**: Keine Aenderung, `remark-gfm` wird wie bisher geladen
- **Nur 1 Datei** wird geaendert: `src/components/chat/ChatMessage.tsx`
