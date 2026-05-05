import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Player } from "@/types/game";
import { Trophy, Play, Eye, Settings, Sliders } from "lucide-react";

interface Props {
  onStart: (player: Player) => void;
  onHighScores: () => void;
  isHandControl: boolean;
  onToggleHandControl: () => void;
  sensitivity: number;
  onSensitivityChange: (val: number) => void;
  smoothing: number;
  onSmoothingChange: (val: number) => void;
}

export default function StartScreen({ 
  onStart, onHighScores, isHandControl, onToggleHandControl,
  sensitivity, onSensitivityChange, smoothing, onSmoothingChange
}: Props) {
  const [form, setForm] = useState<Player>({ name: "", surname: "", class: "" });
  const [showSettings, setShowSettings] = useState(false);
  const canStart = form.name.trim() && form.surname.trim() && form.class.trim();

  return (
    <div className="gradient-bg stars-bg min-h-screen flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md text-center"
      >
        {/* Logo / Title */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-10"
        >
          <div className="inline-block mb-4">
            <img src="/saracmllionaire.jpg" alt="Logo" className="w-32 h-32 mx-auto rounded-full border-2 border-accent bg-secondary/60 glow-gold animate-gold-pulse object-cover" />
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground uppercase tracking-wider leading-tight">
            Who Wants to Be
            <br />
            <span className="text-accent text-4xl md:text-5xl">a Millionaire</span>
          </h1>
          <div className="h-px w-32 mx-auto my-3 bg-gradient-to-r from-transparent via-primary to-transparent" />
          <p className="font-display text-sm text-primary tracking-[0.3em] uppercase">
            Emin Sarac Edition
          </p>
        </motion.div>

        {/* Registration Form */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-card/80 backdrop-blur border border-border rounded-lg p-6 space-y-4 glow-blue"
        >
          {(["name", "surname", "class"] as const).map((field, i) => (
            <motion.div
              key={field}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.1 }}
            >
              <input
                type="text"
                placeholder={field === "class" ? "Class (e.g. 10-A)" : field.charAt(0).toUpperCase() + field.slice(1)}
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                className="w-full px-4 py-3 rounded bg-muted border border-border text-foreground font-body placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
            </motion.div>
          ))}

          <div className="flex flex-col gap-3 pt-2">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onToggleHandControl}
              className={`w-full py-2 rounded border-2 font-display font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                isHandControl 
                ? "bg-red-600/20 border-red-600 text-red-500 shadow-[0_0_15px_rgba(255,0,0,0.4)] animate-gold-pulse" 
                : "bg-muted border-border text-muted-foreground"
              }`}
            >
              <Eye className={`w-5 h-5 ${isHandControl ? "text-red-500" : ""}`} />
              {isHandControl ? "Sharingan Active" : "Enable Sharingan"}
            </motion.button>

            {/* Sharingan Settings Toggle */}
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors py-1"
            >
              <Settings className="w-3 h-3" />
              Sharingan Settings
            </button>

            {/* Sharingan Settings Panel */}
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden bg-black/40 rounded-lg p-3 space-y-3 border border-border/50 text-left"
                >
                  <div className="space-y-1">
                    <label className="text-[10px] text-primary uppercase font-bold flex justify-between">
                      <span>Sensitivity (Pinch)</span>
                      <span>{(sensitivity * 1000).toFixed(0)}</span>
                    </label>
                    <input 
                      type="range" min="0.01" max="0.15" step="0.01"
                      value={sensitivity}
                      onChange={(e) => onSensitivityChange(parseFloat(e.target.value))}
                      className="w-full accent-red-600 h-1"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-primary uppercase font-bold flex justify-between">
                      <span>Smoothness</span>
                      <span>{smoothing}</span>
                    </label>
                    <input 
                      type="range" min="1" max="50" step="1"
                      value={smoothing}
                      onChange={(e) => onSmoothingChange(parseInt(e.target.value))}
                      className="w-full accent-red-600 h-1"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              disabled={!canStart}
              onClick={() => canStart && onStart(form)}
              className="w-full py-3 rounded bg-accent text-accent-foreground font-display font-bold text-lg uppercase tracking-wider glow-gold transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              <Play className="w-5 h-5" /> Start Game
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onHighScores}
              className="w-full py-3 rounded bg-secondary border border-border text-secondary-foreground font-display font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 hover:border-primary/50"
            >
              <Trophy className="w-5 h-5 text-accent" /> High Scores
            </motion.button>
          </div>
        </motion.div>
      </motion.div>

      {/* Credit */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-8 text-right w-full pr-8"
      >
        <p className="text-sm text-muted-foreground">
          Made by FraisenSenpai with ❤️
        </p>
      </motion.div>
    </div>
  );
}
