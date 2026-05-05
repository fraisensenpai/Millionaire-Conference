import { motion } from "framer-motion";
import { PRIZE_LADDER, SAFE_HAVENS } from "@/types/game";

interface Props {
  currentLevel: number;
}

export default function PrizeLadder({ currentLevel }: Props) {
  return (
    <div className="flex flex-col gap-0.5 text-right">
      {[...PRIZE_LADDER].reverse().map((prize, revIdx) => {
        const idx = PRIZE_LADDER.length - 1 - revIdx;
        const isCurrent = idx === currentLevel;
        const isPast = idx < currentLevel;
        const isSafe = SAFE_HAVENS.includes(idx);

        let rowClass = "bg-secondary/40 border-border/40 text-muted-foreground";
        if (isCurrent) rowClass = "bg-primary/20 border-primary text-primary-foreground glow-blue scale-[1.04]";
        if (isPast && !isCurrent) rowClass = "bg-muted/30 border-border/20 text-muted-foreground/50";
        if (isSafe && !isCurrent && !isPast) rowClass = "bg-secondary/40 border-accent/40 text-accent";

        return (
          <motion.div
            key={prize}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: revIdx * 0.03 }}
            className={`prize-row pl-2 pr-12 py-1.5 font-display text-sm font-semibold border transition-all duration-300 ${rowClass}`}
          >
            {isSafe && !isCurrent ? "★ " : ""}
            {prize.toLocaleString()} SCL
          </motion.div>
        );
      })}
    </div>
  );
}
