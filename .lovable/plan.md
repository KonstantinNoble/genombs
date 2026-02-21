

# Fix: Analytics Overview zeigt keine Daten an

## Problem
Die `AnalyticsOverview`-Komponente verwendet den falschen Datenbank-Client. Sie fragt die leere Lovable Cloud Datenbank ab, statt die externe Datenbank, in der alle Website-Analysen gespeichert sind.

## Loesung
Eine einzige Zeile aendern: Den Import in `src/components/gamification/AnalyticsOverview.tsx` von `@/integrations/supabase/client` auf `@/lib/supabase/external-client` umstellen -- genau wie es alle anderen Dateien im Projekt bereits tun.

## Technische Details

**Datei:** `src/components/gamification/AnalyticsOverview.tsx`

Zeile 2 aendern:
- Vorher: `import { supabase } from '@/integrations/supabase/client';`
- Nachher: `import { supabase } from '@/lib/supabase/external-client';`

Keine weiteren Aenderungen noetig. Die Abfrage-Logik, RLS-Policies und alles andere sind bereits korrekt.

