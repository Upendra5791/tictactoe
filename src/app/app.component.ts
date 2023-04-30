import { Component } from '@angular/core';
import { GameState, ICells, Marker, Mode, Player } from './app.model';
import { NextMove } from './next-move.service';
import { Store } from '@ngrx/store';
import { SocketService } from './socket.service';
import { IState } from './store/reducer';
import { updateGameState, updateCells, toggleCurrentTurn, updatePlayerMarker, updateMode, resetMoves, setCurrentTurn } from './store/action';
import { getCurrentTurn, getMode, getStatus } from './store/selector';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  constructor(
    private moveService: NextMove,
    private socketService: SocketService,
    private store: Store<IState>
  ) {
    this.subscibeToStore();
  }

  public mode: Mode = Mode.NA;
  public currentTurn = Player.PLAYER1;
  public playerMarker: Marker = Marker.X;
  public lastTurn!: Player;
  public gameState = GameState.OFF;
  private readonly startCells = this.moveService.startCells;
  public cells: ICells[] = [];
  public Mode = Mode;
  public Marker = Marker;

  public codeInput!: string;
  public gameCode!: string;

  public opponentReady = false;
  public socketId: any;
  public count!: number;

  ngOnInit() {
    this.socketId = this.socketService.playerId;
    this.initialiseEventListners();
  }

  private subscibeToStore() {
    this.store.select(getCurrentTurn).subscribe((currentTurn) => {
      this.currentTurn = currentTurn;
    });
    this.store.select(getMode).subscribe((mode) => {
      this.mode = mode;
      if (this.mode === Mode.MULTI) {
        this.initiateMultiModeFlow();
      } else if (this.mode === Mode.COMPUTER) {
        this.currentTurn = Player.PLAYER1;
        this.startGame();
      } else {
        this.gameCode = '';
      }
    });
    this.store.select(getStatus).subscribe((gameState) => {
      this.gameState = gameState;
      if (gameState === GameState.OFF) this.codeInput = '';
    });
  }

  private initiateMultiModeFlow() {
    this.socketService.connectSocket();
  }

  public initiateGame() {
    this.socketService.initiateGame(this.socketId).then((res) => {
      this.gameCode = res.gameCode;
    });
  }

  public joinGame() {
    if (!this.codeInput) return;
    this.socketService.joinGame(this.socketId, this.codeInput).then((res) => {
      if (!!res.status) {
        this.gameCode = res.gameCode;
      } else {
        alert(res.message);
        this.store.dispatch(updateGameState({ gameState: GameState.OFF }));
      }
    });
  }

  private initialiseEventListners() {
    this.socketService.playerMove.subscribe((playerMove) => {
      this.store.dispatch(updateCells({ cells: playerMove.cells }));
      if (playerMove.playerId !== this.socketService.playerId) {
        this.store.dispatch(
          toggleCurrentTurn({ currentTurn: this.currentTurn })
        );
      }
    });

    this.socketService.gameReady.subscribe((room: any) => {
      if (this.socketId === room.initiator) {
        this.currentTurn = Player.PLAYER1;
        this.playerMarker = Marker.X;
      } else {
        this.currentTurn = Player.PLAYER2;
        this.playerMarker = Marker.O;
      }
      this.store.dispatch(
        updatePlayerMarker({ playerMarker: this.playerMarker })
      );
      this.store.dispatch(updateGameState({ gameState: GameState.ON }));
      this.opponentReady = true;
      this.socketService.roomId = room.roomId;
      this.startGame();
    });
  }

  public selectMode(mode: Mode) {
    this.store.dispatch(updateMode({ mode }));
    this.store.dispatch(
      updateGameState({
        gameState: mode === Mode.COMPUTER ? GameState.ON : GameState.PENDING,
      })
    );
  }

  public startGame() {
    this.store.dispatch(updateCells({ cells: this.startCells }));
    this.store.dispatch(updateGameState({ gameState: GameState.ON }));
    this.store.dispatch(resetMoves());
    this.store.dispatch(setCurrentTurn({ currentTurn: this.currentTurn }));
    if (this.mode === Mode.COMPUTER && this.lastTurn === Player.PLAYER1) {
      this.store.dispatch(toggleCurrentTurn({ currentTurn: this.lastTurn }));
    }
    this.lastTurn = this.currentTurn;
  }

  public clearGame() {
    this.currentTurn = Player.PLAYER1;
    this.startGame();
  }

  public goHome() {
    if (this.mode === Mode.MULTI) this.socketService.exitGame();
    this.mode = Mode.NA;
    this.store.dispatch(updateMode({ mode: this.mode }));
    this.store.dispatch(updateGameState({ gameState: GameState.OFF }));
  }
}
