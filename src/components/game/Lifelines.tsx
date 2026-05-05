import { motion } from "framer-motion";
import { LifelineType } from "@/types/game";
import { Percent, Users, Phone } from "lucide-react";

interface Props {
  used: LifelineType[];
  onUse: (type: LifelineType) => void;
}

const lifelines: { type: LifelineType; icon: typeof Percent; label: string }[] = [
  { type: "fifty-fifty", icon: Percent, label: "50:50" },
  { type: "ask-audience", icon: Users, label: "Audience" },
  { type: "phone-friend", icon: Phone, label: "Phone" },
];

export default function Lifelines({ used, onUse }: Props) {
  return (
    <div className="flex gap-3 justify-center">
      {lifelines.map(({ type, icon: Icon, label }) => {
        const isUsed = used.includes(type);
        return (
          <motion.button
            key={type}
            whileHover={!isUsed ? { scale: 1.1 } : {}}
            whileTap={!isUsed ? { scale: 0.9 } : {}}
            onClick={() => !isUsed && onUse(type)}
            disabled={isUsed}
            className={`flex flex-col items-center gap-1.5 w-20 py-3 rounded-lg border transition-all ${
              isUsed
                ? "bg-muted/10 border-border/20 text-muted-foreground/20 cursor-not-allowed line-through"
                : "bg-secondary/60 border-primary/40 text-primary hover:glow-blue cursor-pointer"
            }`}
          >
            <Icon className="w-6 h-6" />
            <span className="font-display text-xs font-semibold uppercase tracking-wider">{label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
