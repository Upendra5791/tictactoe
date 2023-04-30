import { Action, createReducer, on } from '@ngrx/store';
import {
  incrementMoves,
  markCell,
  resetMoves,
  setCurrentTurn,
  toggleCurrentTurn,
  updateCells,
  updateGameState,
  updateMode,
  updatePlayerMarker,
} from './action';
import { GameState, ICells, Marker, Mode, Player } from '../app.model';

export interface IState {
  count: number;
  cells: ICells[];
  mode: Mode;
  currentTurn: Player;
  playerMarker: Marker;
  gameState: GameState;
  movesCount: number;
}

export const initialState: IState = {
  count: 0,
  cells: [],
  mode: Mode.NA,
  currentTurn: Player.PLAYER1,
  playerMarker: Marker.X,
  gameState: GameState.OFF,
  movesCount: 0,
};

export const appReducer = createReducer(
  initialState,
  on(updateCells, (state, { cells }) => ({
    ...state,
    cells: [...cells],
  })),
  on(markCell, (state, { cell, mark }) => {
    return {
      ...state,
      cells: state.cells.map((m) => {
        return {
          id: m.id,
          mark: m.id === cell.id ? mark : m.mark,
        };
      }),
    };
  }),
  on(toggleCurrentTurn, (state, { currentTurn }) => ({
    ...state,
    currentTurn:
      currentTurn === Player.PLAYER1 ? Player.PLAYER2 : Player.PLAYER1,
  })),
  on(setCurrentTurn, (state, { currentTurn }) => ({
    ...state,
    currentTurn: currentTurn,
  })),
  on(updateMode, (state, { mode }) => ({
    ...state,
    mode: mode,
  })),
  on(updateGameState, (state, { gameState }) => ({
    ...state,
    gameState: gameState,
    mode: gameState === GameState.OFF ? Mode.NA : state.mode
  })),
  on(updatePlayerMarker, (state, { playerMarker }) => ({
    ...state,
    playerMarker: playerMarker,
  })),
  on(incrementMoves, (state) => ({
    ...state,
    movesCount: state.movesCount + 1,
  })),
  on(resetMoves, (state) => ({
    ...state,
    movesCount: 0,
  }))
);

export function reducer(state: IState | undefined, action: Action) {
  return appReducer(state, action);
}

export const reducers = {
  gameState: reducer,
};
