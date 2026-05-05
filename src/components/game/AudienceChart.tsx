import { motion } from "framer-motion";

const LETTERS = ["A", "B", "C", "D"];

export default function AudienceChart({ results }: { results: number[] }) {
  const max = Math.max(...results, 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card/70 border border-primary/30 rounded-lg p-4 mt-4 glow-blue"
    >
      <p className="text-xs text-primary font-display uppercase tracking-wider mb-3 text-center">Audience Poll</p>
      <div className="flex items-end justify-center gap-5 h-28">
        {results.map((val, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <span className="text-xs text-muted-foreground font-display">{val}%</span>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(val / max) * 80}px` }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="w-8 rounded-t bg-gradient-to-t from-primary/60 to-primary"
            />
            <span className="text-xs font-display font-bold text-accent">{LETTERS[i]}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
