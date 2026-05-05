export interface Player {
  name: string;
  surname: string;
  class: string;
}

export interface Question {
  question: string;
  answers: [string, string, string, string];
  correctIndex: number;
  difficulty?: "easy" | "medium" | "hard" | "extremely hard";
  timeLimit?: number; // Time limit in seconds for the question, undefined means no limit
}

export interface HighScoreEntry {
  name: string;
  surname: string;
  class: string;
  prize: number;
  date: string;
  faceDescriptor?: string;
  photo?: string;
}

export type LifelineType = "fifty-fifty" | "ask-audience" | "phone-friend" | "audience";

export interface GameState {
  currentQuestion: number;
  usedLifelines: LifelineType[];
  eliminatedAnswers: number[];
  audienceResults: number[] | null;
  phoneFriendAnswer: string | null;
  selectedAnswer: number | null;
  answerRevealed: boolean;
  gameOver: boolean;
  won: boolean;
  questions: Question[]; // Added to store randomized questions for the game
  timeLeft: number | null; // Remaining time for the current question
  contestantName: string; // Name of the current contestant
  isStarted: boolean; // Whether the game has actually started (contestant in place)
  waitingContestants: string[]; // List of names waiting in the lobby
  questionSetIndex: number; // Index of the question set to use (0-4)
}

export const PRIZE_LADDER = [
  0, 500, 1000, 2000, 3000, 5000, 10000, 25000, 50000, 75000, 150000, 250000, 500000, 750000, 1000000
];

export const SAFE_HAVENS = [2, 7]; // Checkpoints at 1,000 and 25,000
