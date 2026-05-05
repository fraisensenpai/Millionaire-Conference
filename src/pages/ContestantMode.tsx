import { useEffect, useState } from "react";
import { subscribeToGame, updateGameState, getGameState } from "@/lib/gameSync";
import { GameState } from "@/types/game";
import { motion } from "framer-motion";
import AnswerButton from "@/components/game/AnswerButton";
import { Trophy, Users, Split } from "lucide-react";
import Footer from "@/components/layout/Footer";
import { toast } from "sonner";

export default function ContestantMode() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [name, setName] = useState(() => localStorage.getItem("contestantName") || "");
  const [isJoined, setIsJoined] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToGame((state) => {
      setGameState(state);
    });
    return () => unsubscribe();
  }, []);

  const handleJoinLobby = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    const cleanName = name.trim();
    
    try {
      // Fetch fresh state to avoid overwriting others
      const currentState = await getGameState();
      const waitingList = currentState?.waitingContestants || [];
      
      if (!waitingList.includes(cleanName)) {
        const newWaiting = [...waitingList, cleanName];
        await updateGameState({ waitingContestants: newWaiting });
        localStorage.setItem("contestantName", cleanName);
        setIsJoined(true);
        toast.success("Joined lobby!");
      } else {
        localStorage.setItem("contestantName", cleanName);
        setIsJoined(true);
      }
    } catch (error) {
      toast.error("Connection error. Try again.");
    }
  };

  const handleAnswer = async (index: number) => {
    if (!gameState || gameState.selectedAnswer !== null || gameState.answerRevealed || gameState.gameOver) return;
    await updateGameState({ selectedAnswer: index });
  };

  // 1. Lobby / Registration View
  if (!gameState || !gameState.isStarted || gameState.contestantName !== name) {
    return (
      <div className="gradient-bg stars-bg min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <img src="/saracmllionaire.jpg" className="w-48 h-48 rounded-full border-4 border-accent mb-8 glow-gold object-cover" alt="Logo" />
        
        {!isJoined ? (
          <form onSubmit={handleJoinLobby} className="bg-card/80 backdrop-blur-xl p-8 rounded-2xl border border-primary/20 w-full max-w-sm space-y-6 shadow-2xl">
            <div className="space-y-2">
              <h2 className="text-2xl font-display text-white uppercase font-bold tracking-tight">Join Competition</h2>
              <p className="text-zinc-400 text-sm font-body">Enter your name to join the lobby.</p>
            </div>
            <input
              type="text"
              placeholder="Your Name"
              className="w-full p-4 bg-black/40 border border-zinc-700 rounded-xl text-lg text-white font-bold text-center focus:border-accent outline-none transition-all"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full py-4 bg-primary text-white font-bold rounded-xl uppercase tracking-widest hover:scale-105 transition-transform shadow-lg shadow-primary/20"
            >
              Register for Lobby
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="bg-card/80 backdrop-blur-xl p-10 rounded-2xl border border-accent/30 shadow-2xl">
              <h2 className="text-4xl font-display text-primary uppercase font-bold italic mb-2">Welcome {name}!</h2>
              <p className="text-white/80 font-body text-lg">You are in the lobby.</p>
              
              <div className="mt-8 flex flex-col items-center gap-4">
                {gameState?.isStarted && gameState.contestantName !== name ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-orange-900/30 border border-orange-500/30 rounded-xl">
                      <p className="text-orange-200 text-sm uppercase font-bold">
                         Current Session: <span className="text-white">{gameState.contestantName}</span>
                      </p>
                    </div>
                    <p className="text-zinc-500 text-xs animate-pulse italic">Please wait for your turn...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex gap-2 justify-center">
                      <div className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-2 h-2 bg-accent rounded-full animate-bounce" />
                    </div>
                    <p className="text-zinc-400 text-sm uppercase tracking-widest font-bold">Waiting for host to pick you...</p>
                  </div>
                )}
              </div>
            </div>
            
            <button 
              onClick={() => {
                localStorage.removeItem("contestantName");
                setIsJoined(false);
              }}
              className="text-zinc-500 hover:text-white text-xs uppercase font-bold tracking-tighter"
            >
              Change Name / Leave
            </button>
          </div>
        )}
        <Footer />
      </div>
    );
  }

  // 2. Active Game View
  const currentQ = gameState.questions[gameState.currentQuestion];

  if (gameState.gameOver) {
    return (
      <div className="gradient-bg stars-bg min-h-screen flex flex-col items-center justify-center p-4">
        <Trophy className="w-24 h-24 text-accent mb-6 animate-bounce" />
        <h1 className="text-4xl font-display font-bold text-primary mb-2 uppercase italic">{gameState.won ? "You Won!" : "Game Over"}</h1>
        <p className="text-xl text-white/80 font-body">{gameState.won ? "Congratulations, you are a millionaire!" : "Thank you for participating!"}</p>
        <Footer />
      </div>
    );
  }

  return (
    <div className="gradient-bg stars-bg min-h-screen flex flex-col p-4 md:p-8">
      <div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full space-y-6">
        {/* Header: Name & Lifelines */}
        <div className="flex justify-between items-center bg-black/40 p-4 rounded-xl border border-white/5">
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-500 uppercase font-bold">Contestant</span>
            <span className="text-white font-display font-bold uppercase">{name}</span>
          </div>
          
          <div className="flex gap-4">
             <div className={`p-2 rounded-lg border ${gameState.usedLifelines.includes("fifty-fifty") ? 'border-red-500/20 bg-red-500/10 opacity-30' : 'border-accent/40 bg-accent/5'}`}>
               <Split className={`w-5 h-5 ${gameState.usedLifelines.includes("fifty-fifty") ? 'text-red-500' : 'text-accent'}`} />
             </div>
             <div className={`p-2 rounded-lg border ${gameState.usedLifelines.includes("audience") ? 'border-red-500/20 bg-red-500/10 opacity-30' : 'border-accent/40 bg-accent/5'}`}>
               <Users className={`w-5 h-5 ${gameState.usedLifelines.includes("audience") ? 'text-red-500' : 'text-accent'}`} />
             </div>
          </div>
        </div>

        {/* Timer */}
        {gameState.timeLeft !== null && (
          <div className="text-center text-4xl font-display font-bold text-red-500 mb-4 animate-pulse">
            {gameState.timeLeft}
          </div>
        )}

        {/* Audience Poll Results */}
        {gameState.audienceResults && (
          <div className="bg-black/40 backdrop-blur-md p-6 rounded-2xl border border-white/10 mb-6">
            <h4 className="text-center text-accent text-sm font-bold uppercase mb-4">Audience Poll Results</h4>
            <div className="flex items-end justify-center gap-4 h-32">
              {gameState.audienceResults.map((val, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className="text-[10px] text-white">{val}%</div>
                  <div 
                    style={{ height: `${val}px` }} 
                    className={`w-6 rounded-t-sm ${i === currentQ.correctIndex && gameState.answerRevealed ? 'bg-green-500' : 'bg-primary'}`} 
                  />
                  <div className="text-xs font-bold text-zinc-500">{["A", "B", "C", "D"][i]}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <motion.div
          key={gameState.currentQuestion}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="answer-hexagon bg-secondary/80 border-2 border-primary/40 px-8 py-12 text-center shadow-xl"
        >
          <h3 className="text-2xl md:text-3xl font-display font-bold text-white uppercase leading-relaxed">
            {currentQ.question}
          </h3>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQ.answers.map((answer, i) => (
            <AnswerButton
              key={i}
              index={i}
              text={answer}
              selected={gameState.selectedAnswer === i}
              correct={i === currentQ.correctIndex}
              revealed={gameState.answerRevealed}
              eliminated={gameState.eliminatedAnswers?.includes(i)}
              onClick={() => handleAnswer(i)}
            />
          ))}
        </div>
        
        {gameState.selectedAnswer !== null && !gameState.answerRevealed && (
          <div className="text-center mt-8 text-accent font-display text-2xl animate-pulse">
            ANSWER RECORDED
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
