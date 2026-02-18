

# Code-Analyse wird bei URL-Neuanalyse geloescht -- Fix

## Problem

Wenn eine neue URL-Analyse gestartet wird, ruft `Chat.tsx` (Zeile 528) `deleteProfilesForConversation()` auf. Diese Funktion loescht **alle** `website_profiles` fuer die Konversation -- einschliesslich des Profils mit vorhandener `code_analysis`. Die neue Analyse erstellt dann ein frisches Profil ohne Code-Analyse-Daten.

```text
Ablauf aktuell:
1. User hat Profil mit code_analysis (von add-github-analysis)
2. User startet neue URL-Analyse
3. deleteProfilesForConversation() loescht ALLE Profile
4. Neues Profil wird erstellt -- code_analysis = null
5. Queue-Worker analysiert URL, aber ohne GitHub-Daten = kein code_analysis
```

## Loesung

Vor dem Loeschen der alten Profile die `code_analysis` und `github_repo_url` Daten sichern und nach dem Erstellen der neuen Profile auf das "eigene Website"-Profil uebertragen.

### Aenderung in `src/pages/Chat.tsx`

Im `handleStartScan`-Flow (ca. Zeile 523-536) die Logik erweitern:

1. **Vor dem Loeschen**: Die `code_analysis` und `github_repo_url` aus dem bestehenden "eigenen" Profil zwischenspeichern (aus dem aktuellen `profiles` State).

2. **Nach dem Erstellen neuer Profile**: Wenn gespeicherte Code-Analyse-Daten vorhanden sind, diese per Supabase-Update auf das neu erstellte eigene Profil uebertragen.

```text
Ablauf neu:
1. User hat Profil mit code_analysis
2. User startet neue URL-Analyse
3. code_analysis + github_repo_url werden aus State gesichert
4. deleteProfilesForConversation() loescht alte Profile
5. Neue Profile werden erstellt
6. Gesicherte code_analysis wird auf neues eigenes Profil geschrieben
7. Queue-Worker analysiert URL und ueberschreibt code_analysis NUR wenn GitHub-Daten vorhanden
```

### Technische Details

**Datei:** `src/pages/Chat.tsx`

Vor dem `deleteProfilesForConversation`-Aufruf (Zeile 526-528):

```typescript
// Preserve code_analysis from existing own-website profile
const existingOwnProfile = profiles.find(p => p.is_own_website && p.code_analysis);
const preservedCodeAnalysis = existingOwnProfile?.code_analysis ?? null;
const preservedGithubUrl = existingOwnProfile?.github_repo_url ?? null;
```

Nach dem `analyzeWebsite`-Aufruf fuer die eigene URL (ca. Zeile 570-580), wenn `preservedCodeAnalysis` vorhanden ist, das neue Profil updaten:

```typescript
if (preservedCodeAnalysis && result?.profileId) {
  await supabase
    .from("website_profiles")
    .update({
      code_analysis: preservedCodeAnalysis,
      github_repo_url: preservedGithubUrl,
    })
    .eq("id", result.profileId);
}
```

**Datei:** `supabase/functions/process-analysis-queue/index.ts`

In der Update-Logik (Zeile 772-775) sicherstellen, dass `code_analysis` nur ueberschrieben wird, wenn tatsaechlich neue GitHub-Daten analysiert wurden (bereits korrekt -- die Bedingung `if (githubData && analysisResult.codeAnalysis)` prueft dies).

## Betroffene Dateien

| Datei | Aenderung |
|-------|-----------|
| `src/pages/Chat.tsx` | Code-Analyse-Daten vor Loeschung sichern und nach Neuanlage wiederherstellen |

## Was sich nicht aendert
- `delete-profiles/index.ts` -- bleibt wie es ist (loescht alle Profile)
- `process-analysis-queue/index.ts` -- bereits korrekt, ueberschreibt code_analysis nur bei vorhandenen GitHub-Daten
- `add-github-analysis/index.ts` -- unberuehrt

