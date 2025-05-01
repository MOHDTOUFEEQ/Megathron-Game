import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PlayerState {
  score: number;
  gems: number;
  isDead: boolean;
  killedMonster: boolean;
  timeTaken: number;
  startTime: number;
  endingTime: number; 
  health: number;
  username: string;
  isTournamentMode: boolean;
  characterPath: string;
}

const initialState: PlayerState = {
  score: 0,
  gems: 0,
  health: 100,
  isDead: false,
  username: "Kris",
  characterPath: "/src/components/game/images/batman_with_the_gun_63cc21fb.png",
  killedMonster: false,
  timeTaken: 0,
  startTime: 0,
  endingTime: 0,
  isTournamentMode: false,
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    incrementScore: (state, action: PayloadAction<number>) => {
      state.score = action.payload;
    },
    setUsername: (state, action: PayloadAction<string>) => {
      state.username = action.payload;
    },
    collectGem: (state, action: PayloadAction<number>) => {
      state.gems = action.payload;
    },
    setPlayerDead: (state) => {
      state.isDead = true;
    },  
    setHealth: (state, action: PayloadAction<number>) => {
      state.health = action.payload;
    },
    setMonsterKilled: (state, action: PayloadAction<boolean>) => {
      state.killedMonster = action.payload;
    },
    setIsTournamentMode: (state, action: PayloadAction<boolean>) => {
      state.isTournamentMode = action.payload;
    },
    setTimeTaken: (state, action: PayloadAction<number>) => {
      state.timeTaken = action.payload;
    },
    setCharacterPath: (state, action: PayloadAction<string>) => {
      state.characterPath = action.payload;
    },
    setStartTime: (state, action: PayloadAction<number>) => {
      state.startTime = action.payload;
    },
    setEndingTime: (state, action: PayloadAction<number>) => {
      state.endingTime = action.payload;
    },
    resetPlayerState: () => initialState,
  },
});

export const {
  incrementScore,
  collectGem,
  setPlayerDead,
  setHealth,
  setMonsterKilled,
  setTimeTaken,
  setStartTime,
  setEndingTime,
  resetPlayerState,
  setCharacterPath,
  setIsTournamentMode,
} = playerSlice.actions;

export default playerSlice.reducer; 