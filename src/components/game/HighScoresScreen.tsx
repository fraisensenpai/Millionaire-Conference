import React from "react";
import { motion } from "framer-motion";
import { HighScoreEntry } from "@/types/game";
import { Trophy, ArrowLeft, Calendar, Medal } from "lucide-react";

interface Props {
  scores: HighScoreEntry[];
  onBack: () => void;
}

export default function HighScoresScreen({ scores, onBack }: Props) {
  return (
    <div className="gradient-bg stars-bg min-h-screen flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-card/80 backdrop-blur border border-border rounded-lg p-6 md:p-8 shadow-2xl relative"
      >
        <button
          onClick={onBack}
          className="absolute top-4 left-4 p-2 text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="text-center mb-8">
          <div className="inline-block p-3 rounded-full bg-accent/20 mb-4">
            <Trophy className="w-10 h-10 text-accent glow-gold" />
          </div>
          <h2 className="font-display text-3xl font-bold text-foreground uppercase tracking-widest">
            High Scores
          </h2>
          <div className="h-px w-32 mx-auto mt-2 bg-gradient-to-r from-transparent via-primary to-transparent" />
        </div>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {scores.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground uppercase tracking-wider text-sm opacity-50">
              No entries yet. Be the first!
            </div>
          ) : (
            scores.map((score, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between p-4 rounded bg-muted/40 border border-white/5 hover:border-primary/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                    {i + 1}
                  </div>
                  {score.photo && (
                    <img src={score.photo} alt="User" className="w-10 h-10 rounded-full border border-primary/30 object-cover" />
                  )}
                  <div>
                    <div className="text-foreground font-semibold">
                      {score.name} {score.surname}
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase opacity-70">
                      {score.class} • {score.date}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-accent font-display font-bold text-xl">
                    {score.prize} <span className="text-[10px] text-accent/70 ml-1">SCL</span>
                  </div>
                  {i < 3 && (
                    <Medal className={`w-4 h-4 inline-block ${
                      i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-300" : "text-orange-400"
                    }`} />
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onBack}
          className="w-full mt-8 py-3 rounded bg-secondary text-secondary-foreground font-display font-semibold uppercase tracking-wider transition-all hover:bg-secondary/80"
        >
          Back to Menu
        </motion.button>
      </motion.div>
    </div>
  );
}
