import { useState, useCallback, useEffect } from "react";
import { GameState, LifelineType, Player, PRIZE_LADDER, HighScoreEntry } from "@/types/game";
import { questions } from "@/data/questions";
import { shuffle } from "@/lib/utils";

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
  questions: [], // Initialize with an empty array
  timeLeft: null, // Initialize with no timer
};

export function useGameState() {
  const [screen, setScreen] = useState<"start" | "game" | "highscores" | "gameover" | "tutorial">("start");
  const [player, setPlayer] = useState<Player>({ name: "", surname: "", class: "" });
  const [game, setGame] = useState<GameState>(INITIAL_GAME);

  const currentQ = game.questions[game.currentQuestion]; // Updated to use the randomized questions in the game state
  const currentPrize = game.currentQuestion > 0 ? PRIZE_LADDER[game.currentQuestion - 1] : 0;

  useEffect(() => {
    // CRITICAL FIX: Only run timer if we are viewing the game screen
    if (screen !== "game" || game.timeLeft === null || game.gameOver) return;

    // Stop timer if an answer is selected or revealed
    if (game.selectedAnswer !== null || game.answerRevealed) return;

    if (game.timeLeft <= 0) {
      setGame((g) => ({ ...g, answerRevealed: true, gameOver: true, won: false, timeLeft: 0 }));
      return;
    }

    const timer = setTimeout(() => {
      setGame((g) => ({ ...g, timeLeft: g.timeLeft !== null ? g.timeLeft - 1 : null }));
    }, 1000);

    return () => clearTimeout(timer);
  }, [game.timeLeft, game.selectedAnswer, game.answerRevealed, screen, game.gameOver]);

  const startGame = useCallback((p: Player) => {
    setPlayer(p);

    // Filter and shuffle questions by prize tiers
    const easyQuestions = shuffle(questions.filter((q) => q.difficulty === "easy"));
    const mediumQuestions = shuffle(questions.filter((q) => q.difficulty === "medium"));
    const hardQuestions = shuffle(questions.filter((q) => q.difficulty === "hard"));
    const extremelyHardQuestions = shuffle(questions.filter((q) => q.difficulty === "extremely hard"));

    // Select questions for 10-tier ladder
    const selectedQuestions = [
      ...easyQuestions.slice(0, 2), 
      ...mediumQuestions.slice(0, 3), 
      ...hardQuestions.slice(0, 3), 
      ...extremelyHardQuestions.slice(0, 2), 
    ];

    setGame({
      ...INITIAL_GAME,
      currentQuestion: 0,
      questions: selectedQuestions,
      timeLeft: selectedQuestions[0].timeLimit || null,
    });
    // Removed setScreen("game") from here to prevent timer starting during Tutorial
  }, []);

  const selectAnswer = useCallback((index: number) => {
    if (game.answerRevealed || game.selectedAnswer !== null) return;
    setGame((g) => ({ ...g, selectedAnswer: index }));

    setTimeout(() => {
      setGame((g) => {
        const isCorrect = index === currentQ.correctIndex;
        if (isCorrect) {
          if (g.currentQuestion === g.questions.length - 1) {
            return { ...g, answerRevealed: true, gameOver: true, won: true };
          }
          return { ...g, answerRevealed: true };
        }
        return { ...g, answerRevealed: true, gameOver: true, won: false };
      });
    }, 1500);
  }, [game.answerRevealed, game.selectedAnswer, currentQ]);

  const nextQuestion = useCallback(() => {
    setGame((g) => {
      const nextIndex = g.currentQuestion + 1;
      const nextQuestion = g.questions[nextIndex];

      return {
        ...g,
        currentQuestion: nextIndex,
        selectedAnswer: null,
        answerRevealed: false,
        eliminatedAnswers: [],
        audienceResults: null,
        phoneFriendAnswer: null,
        timeLeft: nextQuestion?.timeLimit || null, // Reset timer for the next question
      };
    });
  }, []);

  const useLifeline = useCallback((type: LifelineType) => {
    if (game.usedLifelines.includes(type)) return;

    setGame((g) => {
      const newUsed = [...g.usedLifelines, type];

      if (type === "fifty-fifty") {
        const wrong = [0, 1, 2, 3].filter((i) => i !== currentQ.correctIndex);
        const shuffled = wrong.sort(() => Math.random() - 0.5);
        return { ...g, usedLifelines: newUsed, eliminatedAnswers: [shuffled[0], shuffled[1]] };
      }

      if (type === "ask-audience") {
        const results = [0, 0, 0, 0];
        const remaining = [0, 1, 2, 3].filter((i) => !g.eliminatedAnswers.includes(i));
        let total = 100;
        const correctShare = 40 + Math.floor(Math.random() * 30);
        results[currentQ.correctIndex] = correctShare;
        total -= correctShare;
        remaining.filter((i) => i !== currentQ.correctIndex).forEach((i, idx, arr) => {
          if (idx === arr.length - 1) {
            results[i] = total;
          } else {
            const share = Math.floor(Math.random() * total);
            results[i] = share;
            total -= share;
          }
        });
        return { ...g, usedLifelines: newUsed, audienceResults: results };
      }

      if (type === "phone-friend") {
        const isCorrect = Math.random() < 0.7;
        const remaining = [0, 1, 2, 3].filter((i) => !g.eliminatedAnswers.includes(i));
        const answerIdx = isCorrect
          ? currentQ.correctIndex
          : remaining.filter((i) => i !== currentQ.correctIndex)[Math.floor(Math.random() * (remaining.length - 1))];
        const letter = ["A", "B", "C", "D"][answerIdx];
        const phrases = [
          `I'm pretty sure it's ${letter}. ${currentQ.answers[answerIdx]}.`,
          `Hmm, I'd go with ${letter}. ${currentQ.answers[answerIdx]}, I think.`,
          `My gut says ${letter}. ${currentQ.answers[answerIdx]}!`,
        ];
        return { ...g, usedLifelines: newUsed, phoneFriendAnswer: phrases[Math.floor(Math.random() * phrases.length)] };
      }

      return g;
    });
  }, [game.usedLifelines, currentQ]);

  const [highScores, setHighScores] = useState<HighScoreEntry[]>([]);

  const fetchScores = useCallback(async () => {
    try {
      const res = await fetch("/api/scores");
      if (res.ok) {
        setHighScores(await res.json());
      }
    } catch(e) {
      console.error("Failed to fetch scores", e);
    }
  }, []);

  useEffect(() => {
    fetchScores();
  }, [fetchScores]);

  const endGame = useCallback(() => {
    const prize = game.won ? PRIZE_LADDER[game.currentQuestion] : currentPrize;
    const entry: any = {
      name: player.name,
      surname: player.surname,
      class: player.class,
      prize,
      date: new Date().toLocaleDateString(),
      faceDescriptor: (window as any).currentFaceDescriptor,
      image: (window as any).currentFaceImage,
    };
    
    // Save to local file API instead of localStorage
    fetch('/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    }).then(() => fetchScores()).catch(e => console.error(e));

    setScreen("gameover");
  }, [game, currentPrize, player, fetchScores]);

  const withdrawGame = useCallback(() => {
    const prize = PRIZE_LADDER[game.currentQuestion];
    const entry: any = {
      name: player.name,
      surname: player.surname,
      class: player.class,
      prize,
      date: new Date().toLocaleDateString(),
      faceDescriptor: (window as any).currentFaceDescriptor,
      image: (window as any).currentFaceImage,
    };
    
    fetch('/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    }).then(() => fetchScores()).catch(e => console.error(e));

    setGame(g => ({ ...g, gameOver: true, won: true }));
    setScreen("gameover");
  }, [game, player, fetchScores]);

  const finalPrize = game.won ? PRIZE_LADDER[game.currentQuestion] : currentPrize;

  return {
    screen, setScreen, player, game, currentQ, currentPrize, finalPrize, highScores, fetchScores,
    startGame, selectAnswer, nextQuestion, useLifeline, endGame, withdrawGame,
  };
}
