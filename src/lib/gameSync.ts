import { supabase } from "./supabase";
import { GameState } from "@/types/game";

const GAME_ID = 1;

export const subscribeToGame = (callback: (state: GameState) => void) => {
  // 1. Get initial state
  supabase
    .from('game_state')
    .select('payload')
    .eq('id', GAME_ID)
    .single()
    .then(({ data }) => {
      if (data?.payload) {
        callback(data.payload as GameState);
      }
    });

  // 2. Subscribe to changes
  const channel = supabase
    .channel('game_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'game_state',
        filter: `id=eq.${GAME_ID}`,
      },
      (payload) => {
        if (payload.new && (payload.new as any).payload) {
          callback((payload.new as any).payload as GameState);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

export const updateGameState = async (updates: Partial<GameState>) => {
  const { data, error: fetchError } = await supabase
    .from('game_state')
    .select('payload')
    .eq('id', GAME_ID)
    .single();

  const currentState = data?.payload || {};
  const newState = { 
    ...currentState, 
    ...updates,
    // Ensure waitingContestants is never lost during other updates
    waitingContestants: updates.waitingContestants !== undefined 
      ? updates.waitingContestants 
      : (currentState.waitingContestants || [])
  };

  const { error } = await supabase
    .from('game_state')
    .upsert({ id: GAME_ID, payload: newState });

  if (error) throw error;
};

export const setInitialGameState = async (initialState: GameState) => {
  const { error } = await supabase
    .from('game_state')
    .upsert({ id: GAME_ID, payload: initialState });

  if (error) throw error;
};

export const getGameState = async () => {
  const { data } = await supabase
    .from('game_state')
    .select('payload')
    .eq('id', GAME_ID)
    .single();
    
  return data?.payload as GameState | null;
};
