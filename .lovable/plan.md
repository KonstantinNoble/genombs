
# Bestätigungsdialog für Konversationslöschung

## Ziel

Wenn ein Benutzer das Mülleimer-Icon klickt, um eine Konversation zu löschen, soll ein Bestätigungsdialog (AlertDialog) angezeigt werden. Der Dialog sollte fragen, ob der Benutzer sicher ist, und erst nach Bestätigung die Konversation löschen.

## Umsetzung

### Aenderung 1: `src/pages/Chat.tsx` - State und Handler erweitern

1. Neuen State hinzufügen:
   - `dialogState`: object mit `isOpen: boolean` und `conversationIdToDelete: string | null`

2. Handler-Funktionen erweitern:
   - `handleDeleteConversation` (bestehend): Wird nur noch aufgerufen, wenn der Benutzer im Dialog auf "Löschen" klickt
   - Neue `handleOpenDeleteDialog(id: string)`: Öffnet den Dialog mit der Konversations-ID
   - Neue `handleConfirmDelete()`: Führt die tatsächliche Löschung durch (ruft bestehende `handleDeleteConversation` auf)
   - Neue `handleCancelDelete()`: Schließt den Dialog ohne zu löschen

3. AlertDialog-Komponente hinzufügen:
   - Import der AlertDialog-Komponenten (`AlertDialog`, `AlertDialogTrigger`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogAction`, `AlertDialogCancel`)
   - Dialog vor der Rückgabe des JSX hinzufügen (nach allen anderen Components)
   - Mit `open` und `onOpenChange` für State-Management
   - Titel: "Konversation löschen?"
   - Beschreibung: "Diese Aktion kann nicht rückgängig gemacht werden. Die Konversation und alle zugehörigen Daten werden permanent gelöscht."
   - Cancel-Button: "Abbrechen"
   - Delete-Button (destructive): "Löschen"

### Aenderung 2: `src/components/chat/ChatSidebar.tsx` - onClick Handler anpassen

Statt `onDelete(conv.id)` direkt aufzurufen, wird `onDelete(conv.id)` nur den Dialog öffnen:
- Die `onDelete`-Funktion wird weiterhin verwendet, aber jetzt ruft sie `handleOpenDeleteDialog` statt der direkten Löschung auf

**Hinweis:** Keine Änderung der Signature nötig, nur die Semantik ändert sich.

## Zusammenfassung

| Datei | Aenderung |
|---|---|
| `src/pages/Chat.tsx` | State für Dialog + `handleOpenDeleteDialog`, `handleConfirmDelete`, `handleCancelDelete` Handler + AlertDialog Component |
| `src/components/chat/ChatSidebar.tsx` | Keine Änderung nötig (ruft `onDelete` weiterhin auf) |

