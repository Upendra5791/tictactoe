import { createFeatureSelector, createSelector } from '@ngrx/store';
import { IState } from './reducer';

export const getGameState = createFeatureSelector<IState>('gameState');
export const getCount = createSelector(
  getGameState,
  (state: IState) => state.count
);

export const getCells = createSelector(
  getGameState,
  (state: IState) => state.cells
);

export const getCurrentTurn = createSelector(
  getGameState,
  (state: IState) => state.currentTurn
);

export const getMode = createSelector(
  getGameState,
  (state: IState) => state.mode
);

export const getStatus = createSelector(
  getGameState,
  (state: IState) => state.gameState
);
export const getPlayerMarker = createSelector(
  getGameState,
  (state: IState) => state.playerMarker
);
export const getMovesCount = createSelector(
  getGameState,
  (state: IState) => state.movesCount
);
