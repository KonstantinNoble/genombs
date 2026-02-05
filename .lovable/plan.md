

# Auto-Save für Business Context

## Übersicht

Implementierung eines Auto-Save-Features, das Änderungen an Dropdowns und URL automatisch in der Datenbank speichert, ohne dass der Benutzer auf "Save Context" klicken muss.

## Aktueller Zustand

| Element | Verhalten |
|---------|-----------|
| Dropdowns (Industry, Stage, etc.) | Ändern nur `localContext` State |
| URL-Feld | Ändern nur `websiteUrl` State |
| Save Button | Erforderlich um Änderungen zu speichern |

## Neuer Zustand

| Element | Verhalten |
|---------|-----------|
| Dropdowns (Industry, Stage, etc.) | Auto-Save nach Auswahl (sofort) |
| URL-Feld | Auto-Save nach 800ms Debounce (wenn gültige https:// URL) |
| Save Button | Wird zu "Scan Website" Button (nur für Premium URL-Scanning) |

## Technische Implementierung

### Änderung 1: useBusinessContext.ts erweitern

Neue Funktion `autoSaveField` hinzufügen, die einzelne Felder direkt in der Datenbank speichert:

```typescript
const autoSaveField = useCallback(async (
  field: keyof BusinessContextInput, 
  value: string | null
): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return false;

    const { error } = await (supabase as any)
      .from("user_business_context")
      .upsert({
        user_id: session.user.id,
        [field]: value,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "user_id",
      });

    if (error) {
      console.error("Auto-save failed:", error);
      return false;
    }

    // Update local context and DB context
    setContext(prev => prev ? { ...prev, [field]: value } : null);
    return true;
  } catch (err) {
    console.error("Auto-save error:", err);
    return false;
  }
}, []);
```

**Neue Returns:**
- `autoSaveField`: Funktion zum automatischen Speichern einzelner Felder

### Änderung 2: BusinessContextPanel.tsx anpassen

**Dropdowns (sofortiges Auto-Save):**
```typescript
// Statt:
onValueChange={(value) => setLocalContext({ industry: value || null })}

// Wird zu:
onValueChange={async (value) => {
  setLocalContext({ industry: value || null });
  await autoSaveField("industry", value || null);
}}
```

**URL-Feld (Debounced Auto-Save):**
```typescript
// Neuer useEffect mit Debounce
useEffect(() => {
  // Nur speichern wenn URL gültig oder leer ist
  if (websiteUrl && !websiteUrl.startsWith("https://")) return;
  
  const timer = setTimeout(async () => {
    // Nur speichern wenn URL sich geändert hat
    if (websiteUrl !== context?.website_url) {
      await autoSaveField("website_url", websiteUrl || null);
    }
  }, 800);
  
  return () => clearTimeout(timer);
}, [websiteUrl]);
```

**Save Button wird zu Scan Button:**
- Der "Save Context" Button wird entfernt
- Der "Scan Website" Button wird nur angezeigt, wenn eine neue/geänderte URL vorhanden ist
- "Unsaved" Badge wird entfernt (da alles auto-saved wird)

### Änderung 3: UI-Feedback für Auto-Save

Subtile Bestätigung, dass Änderungen gespeichert wurden:
- Kleines Check-Icon mit kurzer Animation neben dem geänderten Feld
- Kein Toast für einzelne Feld-Speicherungen (zu störend)
- Toast nur bei Fehlern

## Zusammenfassung der Datei-Änderungen

| Datei | Änderungen |
|-------|------------|
| `src/hooks/useBusinessContext.ts` | `autoSaveField` Funktion hinzufügen |
| `src/components/validation/BusinessContextPanel.tsx` | Dropdown-Handler + URL-Debounce + UI-Anpassungen |

## UX-Verbesserungen

1. **Keine Unterbrechung**: Benutzer können Felder ändern ohne den Flow zu unterbrechen
2. **Schnelles Feedback**: Änderungen werden sofort reflektiert
3. **Fehlertoleranz**: Bei Netzwerkfehler wird subtil angezeigt, dass Speichern fehlgeschlagen ist
4. **Website-Scanning bleibt explizit**: Das Premium Website-Scanning erfordert weiterhin einen expliziten Klick

## Deployment

Da dies nur Frontend-Änderungen sind, ist kein manuelles Deployment zum externen Supabase-Projekt erforderlich. Die Änderungen werden automatisch mit Lovable deployed.

