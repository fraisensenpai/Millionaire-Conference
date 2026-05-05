import { useEffect, useState } from "react";
import { subscribeToGame } from "@/lib/gameSync";
import { GameState } from "@/types/game";
import { motion, AnimatePresence } from "framer-motion";
import AnswerButton from "@/components/game/AnswerButton";
import PrizeLadder from "@/components/game/PrizeLadder";
import { useNavigate } from "react-router-dom";
import { Home, Users, Split } from "lucide-react";
import Footer from "@/components/layout/Footer";
import SoundManager from "@/components/game/SoundManager";

export default function ScreenMode() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [showGameOver, setShowGameOver] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = subscribeToGame((state) => {
      setGameState(state);
    });
    return () => unsubscribe();
  }, []);

  // Handle delay for Game Over screen
  useEffect(() => {
    if (gameState?.gameOver) {
      const timer = setTimeout(() => {
        setShowGameOver(true);
      }, 4000); // 4 second delay to see the result
      return () => clearTimeout(timer);
    } else {
      setShowGameOver(false);
    }
  }, [gameState?.gameOver, gameState?.currentQuestion]);
  
  const soundManager = <SoundManager gameState={gameState} />;

  // Lobby View
  if (!gameState || !gameState.isStarted) {
    return (
      <div className="gradient-bg stars-bg min-h-screen flex flex-col items-center justify-center p-8 text-center space-y-12">
        {soundManager}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative"
        >
          <img src="/saracmllionaire.jpg" alt="Logo" className="w-80 h-80 rounded-full border-8 border-accent glow-gold animate-gold-pulse object-cover" />
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-primary px-8 py-2 rounded-full shadow-2xl border-2 border-white/20">
            <span className="text-white font-display font-bold text-xl uppercase tracking-widest whitespace-nowrap">Lobby Open</span>
          </div>
        </motion.div>

        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Instructions */}
          <div className="bg-card/40 backdrop-blur-md p-10 rounded-3xl border border-primary/20 text-left space-y-6">
            <h2 className="text-4xl font-display font-bold text-white uppercase italic">How to Join?</h2>
            <div className="space-y-4">
               <div className="flex items-center gap-4">
                 <div className="bg-primary w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl">1</div>
                 <p className="text-xl text-zinc-300">Visit this website on your phone.</p>
               </div>
               <div className="flex items-center gap-4">
                 <div className="bg-primary w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl">2</div>
                 <p className="text-xl text-zinc-300">Click <span className="text-accent font-bold">"YARIŞMACI"</span> mode.</p>
               </div>
               <div className="flex items-center gap-4">
                 <div className="bg-primary w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl">3</div>
                 <p className="text-xl text-zinc-300">Enter your name and register.</p>
               </div>
            </div>
          </div>

          {/* Player List */}
          <div className="bg-black/40 backdrop-blur-md p-10 rounded-3xl border border-accent/20 flex flex-col h-[400px]">
            <h2 className="text-2xl font-display font-bold text-accent uppercase tracking-widest mb-6">Registered ({gameState?.waitingContestants?.length || 0})</h2>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-primary/20">
              {gameState?.waitingContestants?.map((player, i) => (
                <motion.div
                  key={i}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white/5 border border-white/10 px-6 py-3 rounded-xl flex items-center gap-4"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-2xl font-display font-bold text-white uppercase tracking-wide">{player}</span>
                </motion.div>
              ))}
              {!gameState?.waitingContestants?.length && (
                <p className="text-zinc-500 italic mt-12">Waiting for first player...</p>
              )}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!gameState.questions || !gameState.questions[gameState.currentQuestion]) {
    return (
      <div className="gradient-bg stars-bg min-h-screen flex items-center justify-center">
        <p className="text-zinc-500 italic uppercase tracking-widest animate-pulse">Syncing Game State...</p>
      </div>
    );
  }

  const currentQ = gameState.questions[gameState.currentQuestion];

  return (
    <div className="gradient-bg stars-bg min-h-screen flex flex-col overflow-hidden">
      {soundManager}
      <div className="flex-1 flex flex-col lg:flex-row gap-8 p-8 max-w-[1600px] mx-auto w-full">
        {/* Main Area */}
        <div className="flex-1 flex flex-col justify-center space-y-12 relative">
          
          {/* Contestant Name & Timer */}
          <div className="absolute top-0 left-0 right-0 flex justify-between items-start px-12 pt-8">
            <div className="bg-black/40 border border-primary/30 backdrop-blur-md px-6 py-2 rounded-lg flex items-center gap-6">
              <div>
                <span className="text-zinc-400 text-xs uppercase font-bold tracking-widest block mb-1">Contestant</span>
                <span className="text-white text-2xl font-display font-bold uppercase">{gameState.contestantName || "Ready"}</span>
              </div>
              
              <div className="h-10 w-px bg-white/10" />
              
              <div className="flex gap-3">
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${gameState.usedLifelines.includes("fifty-fifty") ? 'border-red-500/50 bg-red-500/10 opacity-40' : 'border-accent bg-accent/10 glow-gold'}`}>
                   <Split className={`w-5 h-5 ${gameState.usedLifelines.includes("fifty-fifty") ? 'text-red-500' : 'text-accent'}`} />
                </div>
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${gameState.usedLifelines.includes("audience") ? 'border-red-500/50 bg-red-500/10 opacity-40' : 'border-accent bg-accent/10 glow-gold'}`}>
                   <Users className={`w-5 h-5 ${gameState.usedLifelines.includes("audience") ? 'text-red-500' : 'text-accent'}`} />
                </div>
              </div>
            </div>

            <div className="bg-black/50 border-2 border-accent rounded-full w-24 h-24 flex items-center justify-center glow-gold">
              {gameState.timeLeft !== null ? (
                <span className={`text-4xl font-display font-bold ${gameState.timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-accent'}`}>
                  {gameState.timeLeft}
                </span>
              ) : (
                <img src="/saracmllionaire.jpg" className="w-16 h-16 rounded-full object-cover" alt="Logo" />
              )}
            </div>

            <div className="w-48" /> {/* spacer for balance */}
          </div>

          <div className="mt-32">
            {/* Question */}
            <motion.div
              key={gameState.currentQuestion}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="answer-hexagon bg-secondary/80 border-2 border-primary/40 px-16 py-12 text-center glow-blue shadow-2xl relative"
            >
              <h3 className="text-3xl md:text-5xl font-display font-bold text-foreground uppercase leading-relaxed">
                {currentQ.question}
              </h3>
            </motion.div>

            {/* Answers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
              {currentQ.answers.map((answer, i) => (
                <AnswerButton
                  key={i}
                  index={i}
                  text={answer}
                  selected={gameState.selectedAnswer === i}
                  correct={i === currentQ.correctIndex}
                  revealed={gameState.answerRevealed}
                  eliminated={gameState.eliminatedAnswers?.includes(i)}
                  onClick={() => {}} // Read-only
                />
              ))}
            </div>
          </div>
          
          <AnimatePresence>
            {gameState.audienceResults && (
              <motion.div
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                className="absolute right-0 top-1/4 bg-black/60 backdrop-blur-xl p-8 rounded-l-3xl border-l-2 border-y-2 border-primary/30 z-[60]"
              >
                <h3 className="text-xl font-display font-bold text-accent uppercase mb-6 tracking-widest text-center">Audience Poll</h3>
                <div className="flex items-end gap-4 h-48">
                  {gameState.audienceResults.map((val, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <div className="text-xs font-bold text-white">{val}%</div>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${val * 1.5}px` }}
                        className={`w-8 rounded-t-lg shadow-lg ${i === currentQ.correctIndex && gameState.answerRevealed ? 'bg-green-500' : 'bg-primary'}`}
                      />
                      <div className="text-sm font-bold text-zinc-400">{["A", "B", "C", "D"][i]}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
            
            {showGameOver && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-black/95 backdrop-blur-xl z-[100] rounded-3xl animate-in zoom-in-95 duration-500"
              >
                <div className="text-center p-16 space-y-12">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h2 className="text-7xl font-display font-bold text-accent mb-4 uppercase italic tracking-tighter leading-none">
                      {gameState.won ? "Millionaire!" : "Thank You"}
                    </h2>
                    <div className="h-1 w-32 bg-primary mx-auto rounded-full" />
                  </motion.div>

                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="space-y-2"
                  >
                    <p className="text-zinc-500 uppercase tracking-[0.4em] text-sm">Contestant</p>
                    <p className="text-5xl font-display font-bold text-white uppercase">{gameState.contestantName}</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="pt-8"
                  >
                    <p className="text-zinc-400 font-body text-xl">Waiting for next contestant selection...</p>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Prize Ladder */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-black/40 rounded-xl p-4 h-full border border-primary/20 backdrop-blur">
            <PrizeLadder currentLevel={gameState.currentQuestion} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

