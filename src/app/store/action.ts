import { createAction, props } from '@ngrx/store';
import { GameState, ICells, Marker, Mode, Player } from '../app.model';

export const updateCells = createAction(
  '[Game Component] update cells',
  props<{ cells: ICells[] }>()
);
export const markCell = createAction(
  '[Game Component] mark cell',
  props<{ cell: ICells; mark: Marker }>()
);
export const updateGameState = createAction(
  '[Game Component] update game state',
  props<{ gameState: GameState }>()
);
export const toggleCurrentTurn = createAction(
  '[Game Component] update current turn',
  props<{ currentTurn: Player }>()
);
export const setCurrentTurn = createAction(
  '[Game Component] set current turn',
  props<{ currentTurn: Player }>()
);
export const updateMode = createAction(
  '[Game Component] update mode',
  props<{ mode: Mode }>()
);
export const updatePlayerMarker = createAction(
  '[Game Component] update player marker',
  props<{ playerMarker: Marker }>()
);
export const emitUserMove = createAction(
  '[Game Component] emit user move',
  props<{ cells: ICells[] }>()
);
export const incrementMoves = createAction(
  '[Game Component] increment user move'
);
export const resetMoves = createAction('[Game Component] reset user move');
