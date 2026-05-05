import { useEffect, useRef } from "react";
import { GameState } from "@/types/game";

interface SoundManagerProps {
  gameState: GameState | null;
}

export default function SoundManager({ gameState }: SoundManagerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const effectRef = useRef<HTMLAudioElement | null>(null);
  
  // Previous states to detect changes
  const prevQuestionRef = useRef<number | null>(null);
  const prevRevealedRef = useRef<boolean>(false);
  const prevStartedRef = useRef<boolean>(false);

  const playEffect = (src: string) => {
    if (effectRef.current) {
      effectRef.current.src = src;
      effectRef.current.play().catch(e => console.log("Sound play error:", e));
    }
  };

  const playMusic = (src: string, loop: boolean = true) => {
    if (audioRef.current) {
      if (audioRef.current.src.includes(src)) return; // Already playing
      audioRef.current.src = src;
      audioRef.current.loop = loop;
      audioRef.current.play().catch(e => console.log("Music play error:", e));
    }
  };

  useEffect(() => {
    if (!gameState) return;

    // 1. Handle Game Start
    if (gameState.isStarted && !prevStartedRef.current) {
      playEffect("/sounds/start sound.mp3");
      playMusic("/sounds/MainTheme (2).mp3");
    }

    // 2. Handle Answer Reveal
    if (gameState.answerRevealed && !prevRevealedRef.current) {
      const currentQ = gameState.questions[gameState.currentQuestion];
      const isCorrect = gameState.selectedAnswer === currentQ.correctIndex;
      
      if (isCorrect) {
        playEffect("/sounds/Right.mp3");
      } else {
        playEffect("/sounds/Wrong.mp3");
      }
    }

    // 3. Handle Music Changes based on levels
    if (gameState.isStarted && !gameState.answerRevealed && !gameState.gameOver) {
      const level = gameState.currentQuestion;
      
      if (level >= 13) {
        playMusic("/sounds/1.000.000music.mp3");
      } else if (level >= 11) {
        playMusic("/sounds/500.000 music.mp3");
      } else if (level >= 9) {
        playMusic("/sounds/125.000 music.mp3");
      } else if (level >= 7) {
        playMusic("/sounds/64.000 music.mp3");
      } else if (level >= 4) {
        playMusic("/sounds/2.000-.3000 music.mp3");
      } else {
        playMusic("/sounds/MainTheme (2).mp3");
      }
    }

    // 4. Handle Game Over / Won
    if (gameState.gameOver) {
       // Maybe stop music or play a special effect?
       // For now let it be.
    }

    // Update refs
    prevQuestionRef.current = gameState.currentQuestion;
    prevRevealedRef.current = gameState.answerRevealed;
    prevStartedRef.current = gameState.isStarted;
  }, [gameState]);

  return (
    <>
      <audio ref={audioRef} />
      <audio ref={effectRef} />
    </>
  );
}
