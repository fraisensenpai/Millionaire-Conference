import { useEffect, useState, useRef } from "react";
import { subscribeToGame, updateGameState, setInitialGameState, getGameState } from "@/lib/gameSync";
import { GameState, Question } from "@/types/game";
import { questionSets } from "@/data/questions";
import { shuffle } from "@/lib/utils";
import { Play, SkipForward, Eye, Clock, RotateCcw, Upload, FileJson, Home, UserPlus, Users, Split } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import Footer from "@/components/layout/Footer";

const INITIAL_GAME: GameState = {
  currentQuestion: 0,
  usedLifelines: [],
  eliminatedAnswers: [],
  audienceResults: null,
  phoneFriendAnswer: null,
  selectedAnswer: null,
  answerRevealed: false,
  gameOver: false,
  won: false,
  questions: [],
  timeLeft: null,
  contestantName: "",
  isStarted: false,
  waitingContestants: [],
  questionSetIndex: 0,
};

export default function PresenterMode() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [customQuestions, setCustomQuestions] = useState<Question[] | null>(null);
  const [jsonInput, setJsonInput] = useState("");
  const [showJsonArea, setShowJsonArea] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = subscribeToGame((state) => {
      setGameState(state);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!gameState || gameState.timeLeft === null || gameState.gameOver || gameState.answerRevealed || gameState.selectedAnswer !== null || !gameState.isStarted) return;
    
    if (gameState.timeLeft <= 0) {
      updateGameState({ answerRevealed: true, gameOver: true, won: false, timeLeft: 0 }).catch(() => {});
      return;
    }

    const timer = setTimeout(() => {
      updateGameState({ timeLeft: gameState.timeLeft! - 1 }).catch(() => {});
    }, 1000);

    return () => clearTimeout(timer);
  }, [gameState?.timeLeft, gameState?.gameOver, gameState?.answerRevealed, gameState?.selectedAnswer, gameState?.isStarted]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCustomQuestions(parsed);
          toast.success(`${parsed.length} questions loaded from file!`);
          handlePrepareGame(parsed);
        } else {
          toast.error("Invalid JSON format.");
        }
      } catch (error) {
        toast.error("Could not parse JSON file.");
      }
    };
    reader.readAsText(file);
  };

  const handlePasteJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setCustomQuestions(parsed);
        toast.success(`${parsed.length} questions loaded from text!`);
        setShowJsonArea(false);
        handlePrepareGame(parsed);
      } else {
        toast.error("Invalid JSON format. Must be an array.");
      }
    } catch (error) {
      toast.error("Invalid JSON code. Please check for syntax errors.");
    }
  };

  const handlePrepareGame = async (pool: Question[]) => {
    setCustomQuestions(pool);
    try {
      await updateGameState({
        ...INITIAL_GAME,
        questions: [], // Clear DB questions to ensure a fresh set on Start Game
        isStarted: false,
        waitingContestants: gameState?.waitingContestants || [],
      });
      toast.success(`${pool.length} questions loaded into pool!`);
    } catch (error) {
      toast.error("Failed to prepare pool.");
    }
  };

  const handleStartGame = async (name: string) => {
    try {
      const setIndex = gameState?.questionSetIndex || 0;
      const pool: Question[] = customQuestions || questionSets[setIndex % 5];
      
      // Use the pool as is, since each set already has the questions we want
      const finalSet = shuffle(pool); 


      await updateGameState({ 
        contestantName: name,
        questions: finalSet.slice(0, 15),
        isStarted: true,
        gameOver: false,
        won: false,
        currentQuestion: 0,
        selectedAnswer: null,
        answerRevealed: false,
        eliminatedAnswers: [],
        audienceResults: null,
        usedLifelines: [],
        waitingContestants: (gameState?.waitingContestants || []).filter(c => c !== name),
        questionSetIndex: setIndex + 1,
      });
      toast.success(`GAME STARTED WITH ${name.toUpperCase()}!`);
    } catch (error) {
      toast.error("Error starting game.");
    }
  };

  const handleNextContestant = async () => {
    try {
      await updateGameState({
        ...INITIAL_GAME,
        questions: gameState?.questions || [],
        isStarted: false,
        waitingContestants: gameState?.waitingContestants || [],
      });
      toast.info("Returned to lobby.");
    } catch (error) {
      toast.error("Error resetting game.");
    }
  };

  const handleClearLobby = async () => {
    try {
      await updateGameState({ waitingContestants: [] });
      toast.success("Lobby cleared.");
    } catch (error) {
      toast.error("Error.");
    }
  };

  const handleFullReset = async () => {
    try {
      await setInitialGameState(INITIAL_GAME);
      setGameState(INITIAL_GAME);
      toast.success("System fully reset.");
    } catch (error) {
      toast.error("Reset failed.");
    }
  };

  const handleStartTimer = async () => {
    if (!gameState) return;
    const currentQ = gameState.questions[gameState.currentQuestion];
    try {
      await updateGameState({ timeLeft: currentQ.timeLimit || 60 });
    } catch (e) {
      toast.error("Error.");
    }
  };

  const handleRevealAnswer = async () => {
    if (!gameState) return;
    const currentQ = gameState.questions[gameState.currentQuestion];
    const isCorrect = gameState.selectedAnswer === currentQ.correctIndex;
    const isLastQuestion = gameState.currentQuestion === gameState.questions.length - 1;
    
    try {
      await updateGameState({ 
        answerRevealed: true,
        gameOver: !isCorrect || isLastQuestion,
        won: isCorrect && isLastQuestion
      });
    } catch (e) {
      toast.error("Error.");
    }
  };

  const handleNextQuestion = async () => {
    if (!gameState) return;
    const nextIndex = gameState.currentQuestion + 1;
    try {
      await updateGameState({
        currentQuestion: nextIndex,
        selectedAnswer: null,
        answerRevealed: false,
        eliminatedAnswers: [],
        audienceResults: null,
        timeLeft: null,
      });
    } catch (e) {
      toast.error("Error.");
    }
  };

  const handleFiftyFifty = async () => {
    if (!gameState || gameState.usedLifelines.includes("fifty-fifty")) return;
    const currentQ = gameState.questions[gameState.currentQuestion];
    const incorrectIndices = [0, 1, 2, 3].filter(i => i !== currentQ.correctIndex);
    const toEliminate = shuffle(incorrectIndices).slice(0, 2);
    try {
      await updateGameState({
        eliminatedAnswers: toEliminate,
        usedLifelines: [...gameState.usedLifelines, "fifty-fifty"]
      });
    } catch (e) {
      toast.error("Error.");
    }
  };

  const handleAudiencePoll = async () => {
    if (!gameState || gameState.usedLifelines.includes("audience")) return;
    const currentQ = gameState.questions[gameState.currentQuestion];
    const results = [0, 0, 0, 0];
    let remaining = 100;
    let correctWeight = currentQ.difficulty === "easy" ? 70 : currentQ.difficulty === "medium" ? 50 : 30;
    results[currentQ.correctIndex] = correctWeight;
    remaining -= correctWeight;
    [0,1,2,3].filter(i => i !== currentQ.correctIndex).forEach((idx, i, arr) => {
      if (i === arr.length - 1) results[idx] = remaining;
      else {
        const val = Math.floor(Math.random() * remaining);
        results[idx] = val;
        remaining -= val;
      }
    });
    try {
      await updateGameState({
        audienceResults: results,
        usedLifelines: [...gameState.usedLifelines, "audience"]
      });
    } catch (e) {
      toast.error("Error.");
    }
  };

  // RENDER LOGIC
  const dbQuestionCount = gameState?.questions?.length || 0;
  const poolLoaded = (customQuestions || []).length > 0;
  
  // Only show Setup if no questions in DB AND no pool loaded locally
  if (!gameState || (dbQuestionCount === 0 && !poolLoaded)) {
    return (
      <div className="gradient-bg stars-bg min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-card/80 backdrop-blur p-8 rounded-xl border border-border text-center max-w-md w-full space-y-6 shadow-2xl">
          <div className="flex justify-between items-center">
            <button onClick={() => navigate("/")} className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1 text-sm">
              <Home className="w-4 h-4" /> Home
            </button>
            <h2 className="text-2xl font-display font-bold text-primary uppercase tracking-tighter">Presenter Panel</h2>
            <div className="w-12" />
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <input type="file" accept=".json" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
              <button onClick={() => fileInputRef.current?.click()} className="py-4 rounded bg-zinc-800 border border-zinc-700 font-bold flex flex-col items-center gap-2 hover:bg-zinc-700 transition-colors">
                <Upload className="w-6 h-6 text-accent" />
                <span className="text-[10px] uppercase tracking-widest">Upload JSON</span>
              </button>
              <button onClick={() => setShowJsonArea(!showJsonArea)} className="py-4 rounded bg-zinc-800 border border-zinc-700 font-bold flex flex-col items-center gap-2 hover:bg-zinc-700 transition-colors">
                <FileJson className="w-6 h-6 text-primary" />
                <span className="text-[10px] uppercase tracking-widest">Paste JSON</span>
              </button>
            </div>

            <button onClick={() => handlePrepareGame(questionSets[0])} className="w-full py-3 bg-primary/20 text-primary border border-primary/30 rounded font-bold text-xs uppercase tracking-widest hover:bg-primary/30 transition-all">
               Use Default Pool (Set 1)
            </button>

            {showJsonArea && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <textarea
                  className="w-full h-32 p-3 bg-muted border border-border rounded text-xs font-mono focus:ring-1 focus:ring-primary outline-none text-white"
                  placeholder='Paste JSON here...'
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                />
                <button onClick={handlePasteJson} className="w-full py-2 bg-primary text-white rounded font-bold text-sm">Load</button>
              </div>
            )}
            
            <button onClick={handleFullReset} className="w-full py-2 text-zinc-600 hover:text-red-400 text-[10px] uppercase tracking-widest mt-4">⚠ Emergency Reset</button>
          </div>
        </div>
      </div>
    );
  }

  if (!gameState.isStarted) {
    return (
      <div className="gradient-bg stars-bg min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-card/90 backdrop-blur-xl p-10 rounded-2xl border border-primary/20 text-center max-w-2xl w-full space-y-8 shadow-2xl">
          <div className="flex justify-between items-center">
            <div className="text-left">
              <h2 className="text-4xl font-display font-bold text-accent uppercase italic">Lobby</h2>
              <p className="text-zinc-400 text-sm">Waiting for contestants...</p>
            </div>
            <button onClick={handleClearLobby} className="px-4 py-2 bg-red-900/30 text-red-400 border border-red-500/30 rounded text-xs font-bold uppercase">Clear List</button>
          </div>

          <div className="bg-black/40 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="bg-zinc-800/50 px-6 py-3 flex justify-between items-center border-b border-zinc-700">
              <span className="text-xs uppercase font-bold text-primary tracking-widest">Registered ({ (gameState.waitingContestants || []).length })</span>
              <button onClick={async () => { const state = await getGameState(); if (state) setGameState(state); }} className="text-[10px] text-zinc-500 hover:text-white uppercase font-bold">Refresh</button>
            </div>
            <div className="max-h-64 overflow-y-auto divide-y divide-zinc-800">
              {(gameState.waitingContestants || []).length === 0 ? (
                <div className="p-12 text-zinc-500 italic">No one here yet...</div>
              ) : (
                (gameState.waitingContestants || []).map((name, i) => (
                  <div key={i} className="px-6 py-4 flex justify-between items-center hover:bg-white/5 transition-colors">
                    <span className="text-xl font-display font-bold uppercase text-white tracking-wide">{name}</span>
                    <button onClick={() => handleStartGame(name)} className="px-6 py-2 bg-primary text-white font-bold rounded-lg uppercase text-sm flex items-center gap-2 hover:scale-105 transition-all">
                      <Play className="w-4 h-4" /> Start Game
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
          <button onClick={() => updateGameState({ questions: [] })} className="text-zinc-500 hover:text-red-400 text-xs font-bold uppercase tracking-widest transition-colors">← Back to Setup</button>
        </div>
        <Footer />
      </div>
    );
  }

  const currentQ = gameState.questions[gameState.currentQuestion];

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 relative">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-4">
             <button onClick={() => navigate("/")} className="text-zinc-400 hover:text-white transition-colors"><Home className="w-5 h-5" /></button>
             <h1 className="text-2xl font-display text-primary uppercase tracking-tighter">Host: {gameState.contestantName}</h1>
          </div>
          <button onClick={handleNextContestant} className="flex items-center gap-2 text-zinc-500 hover:text-red-400 text-sm font-bold uppercase"><RotateCcw className="w-4 h-4" /> Abandon</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800">
              <div className="flex justify-between text-xs text-zinc-500 mb-4 font-display uppercase tracking-[0.2em]">
                <span>Question {gameState.currentQuestion + 1} / 15</span>
                <span>{currentQ.difficulty}</span>
              </div>
              <h2 className="text-3xl font-bold mb-10 leading-tight">{currentQ.question}</h2>
              <div className="grid grid-cols-2 gap-4">
                {currentQ.answers.map((ans, i) => (
                  <div key={i} className={`p-5 rounded-xl border-2 transition-all ${i === currentQ.correctIndex && gameState.answerRevealed ? 'bg-green-900/40 border-green-500 text-white' : gameState.selectedAnswer === i ? 'bg-orange-900/40 border-orange-500' : 'bg-zinc-800/50 border-zinc-700 text-zinc-400'}`}>
                    <span className="mr-2 font-display font-bold">{["A", "B", "C", "D"][i]}:</span> {ans}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
              <h3 className="text-xs font-bold text-primary uppercase tracking-widest mb-4">Lifelines</h3>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={handleFiftyFifty} disabled={gameState.usedLifelines.includes("fifty-fifty") || gameState.answerRevealed} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-20 transition-all">
                  <Split className="w-6 h-6 text-accent" /><span className="text-[10px] font-bold">50:50</span>
                </button>
                <button onClick={handleAudiencePoll} disabled={gameState.usedLifelines.includes("audience") || gameState.answerRevealed} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-20 transition-all">
                  <Users className="w-6 h-6 text-accent" /><span className="text-[10px] font-bold">Audience</span>
                </button>
              </div>
            </div>

            <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 space-y-3">
              <button onClick={handleStartTimer} disabled={gameState.timeLeft !== null || gameState.selectedAnswer !== null} className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"><Clock className="w-5 h-5" /> Start Timer</button>
              <button onClick={handleRevealAnswer} disabled={gameState.answerRevealed || gameState.selectedAnswer === null} className="w-full py-4 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"><Eye className="w-5 h-5" /> Reveal Answer</button>
              <button onClick={handleNextQuestion} disabled={!gameState.answerRevealed || gameState.gameOver} className="w-full py-4 rounded-xl bg-zinc-700 hover:bg-zinc-600 text-white font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"><SkipForward className="w-5 h-5" /> Next Question</button>
              {gameState.timeLeft !== null && (
                <div className="pt-4 text-center border-t border-zinc-800 mt-4">
                  <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Time</div>
                  <div className={`text-5xl font-display font-bold ${gameState.timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-blue-400'}`}>{gameState.timeLeft}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {gameState.gameOver && (
        <div className="absolute inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-[100] p-6">
          <div className="bg-zinc-900 border-2 border-primary/30 p-12 rounded-[2rem] max-w-lg w-full text-center space-y-8">
            <h2 className="text-6xl font-display font-bold text-primary uppercase italic tracking-tighter">{gameState.won ? "VICTORY!" : "GAME OVER"}</h2>
            <div className="p-6 bg-black/40 rounded-2xl border border-white/5 space-y-1">
              <p className="text-zinc-500 text-xs uppercase">Contestant</p>
              <p className="text-3xl font-display font-bold text-white uppercase">{gameState.contestantName}</p>
            </div>
            <button onClick={handleNextContestant} className="w-full py-6 rounded-2xl bg-accent text-accent-foreground font-display text-2xl font-bold uppercase hover:scale-105 transition-all">Back to Lobby</button>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
