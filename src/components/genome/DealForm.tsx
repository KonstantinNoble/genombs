import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { winReasonOptions, lossReasonOptions } from "@/lib/demo-winloss-data";
import type { Deal } from "@/lib/demo-winloss-data";

interface DealFormProps {
  competitors: string[];
  onSubmit: (deal: Deal) => void;
}

const DealForm = ({ competitors, onSubmit }: DealFormProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [outcome, setOutcome] = useState<"won" | "lost">("won");
  const [competitor, setCompetitor] = useState("");
  const [reason, setReason] = useState("");
  const [value, setValue] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const resetForm = () => {
    setName("");
    setOutcome("won");
    setCompetitor("");
    setReason("");
    setValue("");
    setNotes("");
    setDate(new Date().toISOString().split("T")[0]);
  };

  const handleSubmit = () => {
    if (!name.trim() || !competitor || !reason) return;

    const deal: Deal = {
      id: `d-${Date.now()}`,
      name: name.trim(),
      outcome,
      competitor,
      reason,
      value: value ? Number(value) : undefined,
      notes: notes.trim() || undefined,
      date,
    };

    onSubmit(deal);
    resetForm();
    setOpen(false);
  };

  const reasonOptions = outcome === "won" ? winReasonOptions : lossReasonOptions;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="sm">Log Deal</Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Log a Deal</SheetTitle>
        </SheetHeader>
        <div className="space-y-5 mt-6">
          {/* Deal Name */}
          <div className="space-y-2">
            <Label>Deal Name *</Label>
            <Input
              placeholder="e.g. Enterprise Kunde ABC"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
            />
          </div>

          {/* Outcome Toggle */}
          <div className="space-y-2">
            <Label>Outcome *</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={outcome === "won" ? "default" : "outline"}
                size="sm"
                className={outcome === "won" ? "bg-chart-4 hover:bg-chart-4/90 text-background" : ""}
                onClick={() => { setOutcome("won"); setReason(""); }}
              >
                Won
              </Button>
              <Button
                type="button"
                variant={outcome === "lost" ? "default" : "outline"}
                size="sm"
                className={outcome === "lost" ? "bg-destructive hover:bg-destructive/90" : ""}
                onClick={() => { setOutcome("lost"); setReason(""); }}
              >
                Lost
              </Button>
            </div>
          </div>

          {/* Competitor */}
          <div className="space-y-2">
            <Label>Competitor *</Label>
            <Select value={competitor} onValueChange={setCompetitor}>
              <SelectTrigger>
                <SelectValue placeholder="Select competitor" />
              </SelectTrigger>
              <SelectContent>
                {competitors.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label>Main Reason *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                {reasonOptions.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Value */}
          <div className="space-y-2">
            <Label>Deal Value (optional)</Label>
            <Input
              type="number"
              placeholder="e.g. 50000"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              min={0}
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label>Date</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea
              placeholder="Additional context..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={500}
              rows={3}
            />
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || !competitor || !reason}
            className="w-full"
          >
            Save Deal
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default DealForm;
