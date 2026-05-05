import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Monitor, Presentation } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Footer from "@/components/layout/Footer";

export default function Index() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [showPasswordInput, setShowPasswordInput] = useState<"presenter" | "screen" | null>(null);

  const handleModeSelect = (mode: "contestant" | "presenter" | "screen") => {
    if (mode === "contestant") {
      navigate("/contestant");
    } else {
      setShowPasswordInput(mode);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "12345") { // Simple hardcoded password for salon program
      navigate(`/${showPasswordInput}`);
    } else {
      toast.error("Incorrect Password!");
    }
  };

  return (
    <div className="gradient-bg stars-bg min-h-screen flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md text-center"
      >
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
            <span className="text-accent text-4xl md:text-5xl">a Millionaire?</span>
          </h1>
          <div className="h-px w-32 mx-auto my-3 bg-gradient-to-r from-transparent via-primary to-transparent" />
          <p className="font-display text-sm text-primary tracking-[0.3em] uppercase">
            Conference Room
          </p>
        </motion.div>

        {!showPasswordInput ? (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col gap-4"
          >
            <button
              onClick={() => handleModeSelect("contestant")}
              className="w-full py-4 rounded-xl bg-accent text-accent-foreground font-display font-bold text-xl uppercase tracking-wider glow-gold transition-all hover:scale-105 flex items-center justify-center gap-3"
            >
              <User className="w-6 h-6" /> Contestant Login
            </button>
            <button
              onClick={() => handleModeSelect("presenter")}
              className="w-full py-4 rounded-xl bg-secondary border border-border text-secondary-foreground font-display font-semibold text-lg uppercase tracking-wider transition-all hover:scale-105 flex items-center justify-center gap-3"
            >
              <Monitor className="w-6 h-6" /> Presenter Login
            </button>
            <button
              onClick={() => handleModeSelect("screen")}
              className="w-full py-4 rounded-xl bg-muted border border-border text-muted-foreground font-display font-semibold text-lg uppercase tracking-wider transition-all hover:scale-105 flex items-center justify-center gap-3"
            >
              <Presentation className="w-6 h-6" /> Screen Login
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card/80 backdrop-blur border border-border rounded-xl p-6"
          >
            <h2 className="text-xl font-display font-bold text-primary mb-4 uppercase">
              {showPasswordInput === "presenter" ? "Presenter" : "Screen"} Password
            </h2>
            <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
              <input
                type="password"
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded bg-muted border border-border text-foreground text-center text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordInput(null);
                    setPassword("");
                  }}
                  className="flex-1 py-3 rounded bg-secondary text-secondary-foreground font-display font-semibold transition-all hover:bg-secondary/80"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded bg-accent text-accent-foreground font-display font-bold transition-all hover:opacity-90"
                >
                  Enter
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </motion.div>
      <Footer />
    </div>
  );
}
