

# Fix: Informative Fehlermeldung bei fehlenden Credits fuer Auto-Summary

## Problem

Wenn nach einer Analyse die automatische Zusammenfassung wegen fehlender Credits fehlschlaegt, sieht der Nutzer **keine Erklaerung** -- der Fehler wird nur in der Konsole geloggt. Das wirkt, als waere die Analyse abgebrochen.

## Loesung

Im `generateSummary` catch-Block (Zeile 238-241 in `useChatMessages.ts`) wird der `insufficient_credits`-Fehler erkannt und eine **ausfuehrliche, englische Chat-Nachricht** als Assistant-Message angezeigt. So weiss der Nutzer genau, was passiert ist.

## Aenderung

**Datei:** `src/hooks/useChatMessages.ts` -- `generateSummary` catch-Block (Zeilen 238-241)

Vorher:
```text
} catch (e) {
    console.error("Summary generation failed:", e);
    setIsStreaming(false);
}
```

Nachher:
```text
} catch (e) {
    setIsStreaming(false);
    const errMsg = e instanceof Error ? e.message : "";

    // Remove the temporary streaming message if it exists
    setMessages((prev) => prev.filter((m) => !m.id.startsWith("temp-summary-")));

    if (errMsg.startsWith("insufficient_credits:")) {
        const hours = errMsg.split(":")[1];
        const creditNotice = await saveMessage(
            activeId,
            "assistant",
            "⚠️ **Auto-Summary Skipped — Not Enough Credits**\n\n"
            + "Your website analysis completed successfully and the results are available in the dashboard on the right.\n\n"
            + "However, generating the AI-powered summary in this chat requires additional credits, "
            + `and your daily limit has been reached. Your credits will reset in **${hours} hour(s)**.\n\n`
            + "**What you can do:**\n"
            + "- Review your full analysis results in the dashboard panels\n"
            + "- Come back after your credits reset to ask follow-up questions\n"
            + "- Upgrade to Premium for a higher daily credit limit"
        );
        setMessages((prev) => [...prev, creditNotice]);
    } else {
        console.error("Summary generation failed:", e);
    }
}
```

Zusaetzlich wird in `chat/index.ts` der `hoursLeft`-Bug gefixt (Zeilen ca. 382-398), sodass nach einem Credit-Reset der neue `resetAt`-Wert verwendet wird:

**Datei:** `supabase/functions/chat/index.ts` -- `checkAndDeductCredits`

- Eine Variable `currentResetAt` wird eingefuehrt
- Nach dem Reset-Block wird `currentResetAt` auf den neuen Zeitstempel gesetzt
- `hoursLeft` wird mit `currentResetAt` statt dem alten `resetAt` berechnet

## Ergebnis

- Analyse-Ergebnisse bleiben im Dashboard sichtbar
- Der Nutzer sieht eine klare, englische Erklaerung im Chat
- Die Stunden-Angabe bis zum Reset ist korrekt (dank `hoursLeft`-Fix)

