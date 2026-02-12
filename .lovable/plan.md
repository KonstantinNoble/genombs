

# Translate German UI Text to English

## Verification Result (Task 1)

The delete flow has been fully verified. When a conversation is deleted (either manually or via the 20-conversation limit), all related data is correctly removed in the proper order:

1. **improvement_tasks** -- deleted via edge function (service role)
2. **website_profiles** -- deleted via edge function (service role)
3. **messages** -- deleted via client (RLS policy in place)
4. **conversations** -- deleted via client (RLS policy in place)

No changes needed here.

## German Text Translation (Task 2)

### Change 1: `src/pages/Chat.tsx` -- Line 299 (Error toast)

Current (German):
"Alte Analysedaten konnten nicht geloescht werden. Bitte versuche es erneut."

New (English):
"Failed to delete old analysis data. Please try again."

### Change 2: `src/pages/Chat.tsx` -- Lines 623-631 (Delete confirmation dialog)

Current (German):
- Title: "Konversation loeschen?"
- Description: "Diese Aktion kann nicht rueckgaengig gemacht werden. Die Konversation und alle zugehoerigen Daten werden permanent geloescht."
- Cancel: "Abbrechen"
- Confirm: "Loeschen"

New (English):
- Title: "Delete conversation?"
- Description: "This action cannot be undone. The conversation and all associated data will be permanently deleted."
- Cancel: "Cancel"
- Confirm: "Delete"

### Note on other files

- **Edge function comments** (freemius-webhook, check-email-availability) and **hook comments** (useFreemiusCheckout) contain German comments. These are internal developer comments and not user-facing, but will also be translated for consistency.

## Summary

| File | Line(s) | Change |
|---|---|---|
| `src/pages/Chat.tsx` | 299 | German error toast to English |
| `src/pages/Chat.tsx` | 623-631 | German dialog text to English |
| `supabase/functions/freemius-webhook/index.ts` | Various | German comments to English |
| `supabase/functions/check-email-availability/index.ts` | Various | German comments to English |
| `src/hooks/useFreemiusCheckout.ts` | 18 | German comment to English |

