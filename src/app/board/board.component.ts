import { Component } from '@angular/core';
import { NextMove } from '../next-move.service';
import { SocketService } from '../socket.service';
import { GameState, ICells, Marker, Mode, Player } from '../app.model';
import { Store, select } from '@ngrx/store';
import { IState } from '../store/reducer';
import {
  incrementMoves,
  markCell,
  toggleCurrentTurn,
  updateGameState,
} from '../store/action';
import { takeWhile } from 'rxjs';
import {
  getCells,
  getCurrentTurn,
  getMode,
  getStatus,
  getPlayerMarker,
  getMovesCount,
} from '../store/selector';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})
export class BoardComponent {
  constructor(
    private moveService: NextMove,
    private socketService: SocketService,
    private store: Store<IState>
  ) {}

  public cells: ICells[] = [];
  public currentTurn!: Player;
  public mode!: Mode;
  public status: GameState = GameState.OFF;
  public playerMarker: Marker = Marker.X;
  public movesCount = 0;

  public get currentPlayerMarker(): Marker {
    return this.currentTurn === Player.PLAYER1 ? Marker.X : Marker.O;
  }
  public gameOver = false;
  public Player = Player;

  ngOnInit() {
    this.subscibeToStore();
  }

  private subscibeToStore() {
    this.store.select(getCells).subscribe((cells) => {
      this.cells = cells;
      this.checkBoard();
    });
    this.store
      .pipe(
        select(getCurrentTurn),
        takeWhile(() => !this.gameOver)
      )
      .subscribe((currentTurn) => {
        this.currentTurn = currentTurn;
        if (
          this.mode === Mode.COMPUTER &&
          this.currentTurn === Player.PLAYER2
        ) {
          this.executeComputerMove();
        }
      });
    this.store.select(getMode).subscribe((mode) => (this.mode = mode));
    this.store.select(getStatus).subscribe((status) => (this.status = status));
    this.store
      .select(getPlayerMarker)
      .subscribe((playerMarker) => (this.playerMarker = playerMarker));
    this.store
      .select(getMovesCount)
      .subscribe((movesCount) => (this.movesCount = movesCount));
  }

  private executeComputerMove() {
    const cellToMark = this.moveService.checkBoard(this.cells);
    // only to emulate real user
    if (cellToMark) {
      setTimeout(() => {
        this.markCell(cellToMark.cell.id);
      }, 200);
    }
  }

  private checkBoard() {
    this.checkForGame();
    if (this.gameOver) {
      this.store.dispatch(updateGameState({ gameState: GameState.GAMEOVER }));
      return;
    }
    if (this.movesCount === 9) {
      this.store.dispatch(updateGameState({ gameState: GameState.TIE }));
      return;
    }
  }

  public markCell(id: string) {
    this.store.dispatch(incrementMoves());
    if (this.gameOver) return;
    const markedCell = this.cells.find((f) => f.id === id);
    if (!!markedCell && markedCell.mark === Marker.NA) {
      this.store.dispatch(
        markCell({
          cell: markedCell,
          mark:
            this.mode === Mode.MULTI
              ? this.playerMarker
              : this.currentPlayerMarker,
        })
      );
      if (this.mode === Mode.MULTI) {
        this.socketService.emitMove(this.cells);
      }
      if (this.gameOver || this.movesCount === 9) return;
      this.store.dispatch(toggleCurrentTurn({ currentTurn: this.currentTurn }));
    }
  }

  public checkForGame() {
    for (let i = 1; i <= 3; i++) {
      this.gameOver = this.checkCells(
        this.cells.filter((f) => f.id.startsWith(String(i)))
      );
      if (this.gameOver) return;
      this.gameOver = this.checkCells(
        this.cells.filter((f) => f.id.endsWith(String(i)))
      );
      if (this.gameOver) return;
    }

    this.gameOver = this.checkCells(
      this.cells.filter((f) => f.id == '11' || f.id == '22' || f.id == '33')
    );
    if (this.gameOver) return;

    this.gameOver = this.checkCells(
      this.cells.filter((f) => f.id == '13' || f.id == '22' || f.id == '31')
    );
    if (this.gameOver) return;
  }

  public checkCells(cells: ICells[]) {
    return (
      cells.every((f) => f.mark === Marker.X) ||
      cells.every((f) => f.mark === Marker.O)
    );
  }

  public boardEnabled(): boolean {
    return this.status === GameState.ON && this.currentTurn === Player.PLAYER1;
  }
}
