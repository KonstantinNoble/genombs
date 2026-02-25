

## "Manage your subscription" Button fuer Premium-User

### Aenderung

In `src/pages/Profile.tsx` wird im Premium-Status-Bereich (Zeilen 159-199) ein neuer Button eingefuegt, der nur fuer Premium-User sichtbar ist. Der Button oeffnet `https://customers.freemius.com/` in einem neuen Tab.

### Details

- **Position**: Unterhalb der Auto-Renewal-Info, innerhalb des Premium-Active-Blocks (nach Zeile 198)
- **Styling**: Outline-Button mit voller Breite, konsistent mit dem bestehenden Design
- **Verhalten**: Oeffnet den Link in einem neuen Tab (`target="_blank"`, `rel="noopener noreferrer"`)
- **Icon**: ExternalLink-Icon aus lucide-react fuer visuelles Feedback
- **Sichtbarkeit**: Nur wenn `credits?.is_premium` true ist

### Technisch

Einzige Datei: `src/pages/Profile.tsx`
- Import `ExternalLink` von lucide-react hinzufuegen
- Nach dem Auto-Renewal-Status-Block (Zeile 198) den Button einfuegen:

```tsx
<a
  href="https://customers.freemius.com/"
  target="_blank"
  rel="noopener noreferrer"
  className="block mt-3"
>
  <Button variant="outline" className="w-full gap-2">
    Manage your subscription
    <ExternalLink className="w-4 h-4" />
  </Button>
</a>
```

