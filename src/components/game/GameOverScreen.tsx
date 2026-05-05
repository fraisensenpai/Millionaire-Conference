import { motion } from "framer-motion";
import { Player } from "@/types/game";
import { RotateCcw } from "lucide-react";

interface Props {
  player: Player;
  prize: number;
  won: boolean;
  onRestart: () => void;
}

export default function GameOverScreen({ player, prize, won, onRestart }: Props) {
  return (
    <div className="gradient-bg stars-bg min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-md w-full">
        
        <motion.div initial={{ y: -20 }} animate={{ y: 0 }} transition={{ delay: 0.3 }}>
          
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground uppercase tracking-wider mb-1">
            {won ? "Congratulations!" : "Game Over"}
          </h2>
          <p className="text-primary font-display text-lg uppercase tracking-wider mb-6">
            {player.name} {player.surname}
          </p>
        </motion.div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
          className="bg-card/70 border border-accent/40 rounded-lg p-8 mb-8 glow-gold">
          
          <p className="text-sm text-muted-foreground font-display uppercase tracking-widest mb-3">You Won</p>
          <p className="font-display text-5xl font-bold text-accent">
            {prize.toLocaleString()} SCL
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRestart}
          className="px-8 py-3 rounded bg-primary text-primary-foreground font-display font-bold uppercase tracking-wider glow-blue flex items-center justify-center gap-2 mx-auto">
          
          <RotateCcw className="w-5 h-5" /> Play Again
        </motion.button>
      </motion.div>


    </div>);

}