import { motion } from "framer-motion";

interface Props {
  index: number;
  text: string;
  selected: boolean;
  correct: boolean;
  revealed: boolean;
  eliminated: boolean;
  onClick: () => void;
}

const LETTERS = ["A", "B", "C", "D"];

export default function AnswerButton({ index, text, selected, correct, revealed, eliminated, onClick }: Props) {
  const isCorrectRevealed = revealed && correct;
  const isWrongRevealed = revealed && selected && !correct;

  let containerClass = "bg-secondary/70 border-primary/30 hover:border-primary/70 hover:bg-secondary";
  let letterClass = "text-accent";
  let textClass = "text-foreground";

  if (eliminated) {
    containerClass = "bg-muted/20 border-border/20 opacity-20 pointer-events-none";
    letterClass = "text-muted-foreground";
    textClass = "text-muted-foreground";
  }

  if (selected && !revealed) {
    containerClass = "bg-primary/30 border-primary animate-pulse-glow shadow-[0_0_15px_rgba(var(--primary),0.3)]";
    letterClass = "text-white";
  }

  if (isCorrectRevealed) {
    containerClass = "bg-correct border-correct shadow-[0_0_30px_rgba(34,197,94,0.6)] z-10 scale-105";
    letterClass = "text-white";
    textClass = "text-white font-bold";
  }

  if (isWrongRevealed) {
    containerClass = "bg-wrong border-wrong shadow-[0_0_30px_rgba(239,68,68,0.6)] z-10";
    letterClass = "text-white";
    textClass = "text-white";
  }

  return (
    <motion.button
      whileHover={!eliminated && !revealed ? { scale: 1.02 } : {}}
      whileTap={!eliminated && !revealed ? { scale: 0.98 } : {}}
      onClick={eliminated || revealed ? undefined : onClick}
      disabled={eliminated || revealed}
      className={`answer-hexagon w-full py-8 px-24 border-2 transition-all duration-300 text-left flex items-center gap-6 ${containerClass}`}
    >
      <span className={`font-display font-bold text-2xl ${letterClass}`}>{LETTERS[index]}:</span>
      <span className={`font-body font-medium text-lg ${textClass}`}>{text}</span>
    </motion.button>
  );
}
