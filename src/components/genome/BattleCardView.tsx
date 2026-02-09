import { useState } from "react";
import { Button } from "@/components/ui/button";
import GenomeCard from "@/components/genome/GenomeCard";
import type { BattleCard } from "@/lib/demo-battlecard-data";
import { toast } from "@/hooks/use-toast";

interface BattleCardViewProps {
  cards: BattleCard[];
}

const SectionBlock = ({
  label,
  items,
  borderColor,
  mono = false,
}: {
  label: string;
  items: string[];
  borderColor: string;
  mono?: boolean;
}) => (
  <div className={`border-l-2 ${borderColor} pl-4 mb-5`}>
    <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2">
      {label}
    </p>
    <ol className="space-y-2">
      {items.map((item, i) => (
        <li
          key={i}
          className={`text-sm leading-relaxed ${mono ? "font-mono text-primary bg-muted/50 p-2 rounded" : "text-foreground"}`}
        >
          <span className="text-muted-foreground mr-2 text-xs">{i + 1}.</span>
          {item}
        </li>
      ))}
    </ol>
  </div>
);

const copyCardToClipboard = (card: BattleCard) => {
  const text = [
    `BATTLE CARD: vs ${card.competitor} (${card.domain})`,
    "",
    "HOW WE WIN:",
    ...card.howWeWin.map((item, i) => `${i + 1}. ${item}`),
    "",
    "THEIR PITCH:",
    ...card.theirPitch.map((item, i) => `${i + 1}. ${item}`),
    "",
    "COUNTER ARGUMENTS:",
    ...card.counterArguments.map((item, i) => `${i + 1}. ${item}`),
    "",
    "TRIGGER PHRASES:",
    ...card.triggerPhrases.map((item, i) => `${i + 1}. ${item}`),
    "",
    "WHEN WE LOSE:",
    ...card.whenWeLose.map((item, i) => `${i + 1}. ${item}`),
  ].join("\n");

  navigator.clipboard.writeText(text).then(() => {
    toast({
      title: "Copied to clipboard",
      description: `Battle Card vs ${card.competitor} copied.`,
    });
  });
};

const BattleCardView = ({ cards }: BattleCardViewProps) => {
  const [expandedIndex, setExpandedIndex] = useState<number>(0);

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground uppercase tracking-wide">
        Sales enablement cards generated from your competitive analysis
      </p>

      {cards.map((card, idx) => (
        <GenomeCard
          key={card.competitor}
          title={`vs ${card.competitor}`}
          className={expandedIndex === idx ? "" : "cursor-pointer"}
        >
          {expandedIndex === idx ? (
            <div>
              <SectionBlock
                label="How We Win"
                items={card.howWeWin}
                borderColor="border-chart-4"
              />
              <SectionBlock
                label="Their Pitch"
                items={card.theirPitch}
                borderColor="border-muted-foreground"
              />
              <SectionBlock
                label="Counter Arguments"
                items={card.counterArguments}
                borderColor="border-primary"
              />
              <SectionBlock
                label="Trigger Phrases"
                items={card.triggerPhrases}
                borderColor="border-primary"
                mono
              />
              <SectionBlock
                label="When We Lose"
                items={card.whenWeLose}
                borderColor="border-destructive"
              />
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyCardToClipboard(card)}
                >
                  Copy to Clipboard
                </Button>
                {cards.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedIndex(-1)}
                    className="text-muted-foreground"
                  >
                    Collapse
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <button
              onClick={() => setExpandedIndex(idx)}
              className="w-full text-left"
            >
              <p className="text-sm text-muted-foreground">
                {card.howWeWin[0]?.slice(0, 120)}...
              </p>
              <p className="text-xs text-primary mt-2">Click to expand</p>
            </button>
          )}
        </GenomeCard>
      ))}
    </div>
  );
};

export default BattleCardView;
