

# Supabase-Projekt auf xnkspttfhcnqzhmazggn umstellen

## 1 Änderung

### `src/lib/supabase/external-client.ts` aktualisieren

Die drei Konstanten werden auf das richtige Projekt umgestellt:

| Feld | Alt | Neu |
|------|-----|-----|
| URL | `https://fhzqngbbvwpfdmhjfnvk.supabase.co` | `https://xnkspttfhcnqzhmazggn.supabase.co` |
| Anon Key | `eyJ...Glo` (fhzq...) | `eyJ...2_ec` (xnks...) |
| Project ID | `fhzqngbbvwpfdmhjfnvk` | `xnkspttfhcnqzhmazggn` |

Alle anderen Dateien (AuthContext, Edge Functions, Components) importieren bereits aus dieser einen Datei -- keine weiteren Änderungen nötig.

### Technische Details

Nur 3 Zeilen in `src/lib/supabase/external-client.ts` ändern sich:

```typescript
const EXTERNAL_SUPABASE_URL = "https://xnkspttfhcnqzhmazggn.supabase.co";
const EXTERNAL_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhua3NwdHRmaGNucXpobWF6Z2duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NDU0NDAsImV4cCI6MjA4NjMyMTQ0MH0.AluwfNe4T-tJQo73ResSpnqZ3Dky34CBv50ubxX2_ec";
export const SUPABASE_PROJECT_ID = "xnkspttfhcnqzhmazggn";
```

