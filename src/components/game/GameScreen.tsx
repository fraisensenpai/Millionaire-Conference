import { motion } from "framer-motion";
import { Question, GameState, LifelineType } from "@/types/game";
import PrizeLadder from "./PrizeLadder";
import AnswerButton from "./AnswerButton";
import Lifelines from "./Lifelines";
import AudienceChart from "./AudienceChart";

interface Props {
  question: Question;
  game: GameState;
  playerName: string;
  onAnswer: (index: number) => void;
  onLifeline: (type: LifelineType) => void;
  onNext: () => void;
  onEnd: () => void;
  onWithdraw: () => void;
}

export default function GameScreen({ question, game, playerName, onAnswer, onLifeline, onNext, onEnd, onWithdraw }: Props) {
  const showNext = game.answerRevealed && !game.gameOver;
  const showGameOver = game.answerRevealed && game.gameOver;

  return (
    <div className="gradient-bg stars-bg min-h-screen flex flex-col">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 md:px-8 py-3 border-b border-border/20 bg-card/30 backdrop-blur">
        <h2 className="font-display text-primary text-xs md:text-sm uppercase tracking-[0.2em]">
          Who Wants to Be a Millionaire
        </h2>
        <span className="font-body text-muted-foreground text-sm">
          <span className="text-accent font-display">{playerName}</span>
        </span>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 p-4 md:p-6">
        {/* Left: Main game area */}
        <div className="flex-1 flex flex-col justify-center max-w-7xl mx-auto lg:mx-0 w-full space-y-4">
          {/* Timer Display */}
          {game.timeLeft !== null && (
            <div className="text-center text-lg font-bold text-red-500 mb-4">
              Time Left: <span>{game.timeLeft}</span> seconds
            </div>
          )}

          {/* Lifelines */}
          <Lifelines used={game.usedLifelines} onUse={onLifeline} />

          {/* Lifeline results */}
          {game.audienceResults && <AudienceChart results={game.audienceResults} />}

          {game.phoneFriendAnswer && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card/70 border border-primary/30 rounded-lg p-4 glow-blue"
            >
              <p className="text-xs text-primary font-display uppercase tracking-wider mb-1">📞 Phone a Friend</p>
              <p className="text-foreground font-body italic">"{game.phoneFriendAnswer}"</p>
            </motion.div>
          )}

          {/* Question */}
          <motion.div
            key={game.currentQuestion}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="answer-hexagon bg-secondary/60 border-2 border-primary/40 px-16 py-10 text-center glow-blue"
          >
            <p className="text-xs text-primary font-display uppercase tracking-widest mb-2">
              Question {game.currentQuestion + 1}
            </p>
            <h3 className="text-xl md:text-2xl font-display font-semibold text-foreground uppercase">
              {question.question}
            </h3>
          </motion.div>

          {/* Answer grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {question.answers.map((answer, i) => (
              <AnswerButton
                key={i}
                index={i}
                text={answer}
                selected={game.selectedAnswer === i}
                correct={i === question.correctIndex}
                revealed={game.answerRevealed}
                eliminated={game.eliminatedAnswers.includes(i)}
                onClick={() => onAnswer(i)}
              />
            ))}
          </div>

          {/* Continue / End buttons */}
          {showNext && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center gap-4 pt-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onWithdraw}
                className="px-8 py-3 font-display font-bold uppercase tracking-wider bg-red-600 hover:bg-red-700 text-white rounded shadow-[0_0_15px_rgba(220,38,38,0.5)]"
              >
                Withdraw
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onNext}
                className="px-8 py-3 font-display font-bold uppercase tracking-wider bg-accent text-accent-foreground rounded glow-gold"
              >
                Next Question →
              </motion.button>
            </motion.div>
          )}

          {showGameOver && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center pt-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onEnd}
                className="px-8 py-3 font-display font-bold uppercase tracking-wider bg-accent text-accent-foreground rounded glow-gold animate-gold-pulse"
              >
                {game.won ? "🏆 Claim Your Prize!" : "See Results"}
              </motion.button>
            </motion.div>
          )}
        </div>

        {/* Right: Prize ladder */}
        <div className="lg:w-52 flex-shrink-0 ml-auto">
          <PrizeLadder currentLevel={game.currentQuestion} />
        </div>
      </div>
    </div>
  );
}
