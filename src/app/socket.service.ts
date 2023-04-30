import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { io } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import { GameState, Mode } from './app.model';
import { updateMode, updateGameState } from './store/action';
import { IState } from './store/reducer';

@Injectable()
export class SocketService {
  public playerMove = new Subject<any>();
  public gameReady = new Subject<string>();
  public socket: any;
  public playerId: string = '';
  public roomId = '';

  public generatePlayerId() {
    return uuidv4();
  }

  constructor(private store: Store<IState>) {
    this.playerId = this.generatePlayerId();
  }

  public initialiseListeners() {
    this.socket.on('connect', () => {
      console.log('socket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('socket disconnected');
    });

    this.socket?.on('GAME_START', (room: any) => {
      this.gameReady.next(room);
    });

    this.socket?.on('PLAYER_MOVE', (data: any) => {
      this.playerMove.next(data);
    });

    this.socket?.on('EXIT_GAME', () => {
      this.store.dispatch(updateMode({ mode: Mode.NA }));
      this.store.dispatch(updateGameState({ gameState: GameState.OFF }));
    });
  }

  public initiateGame(player: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.socket.emit('INITIATE_GAME', player, (response: any) => {
        console.log(response);
        resolve(response);
      });
    });
  }

  public joinGame(player: string, code: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.socket.emit('JOIN_GAME', player, code, (response: any) => {
        console.log(response);
        resolve(response);
      });
    });
  }

  public emitMove(cells: any[]) {
    this.socket.emit(
      'PLAYER_MOVE',
      cells,
      this.playerId,
      this.roomId,
      (response: any) => {
        console.log(response);
      }
    );
  }

  public exitGame() {
    this.socket.emit('EXIT_GAME', this.roomId, (response: any) => {
      console.log(response);
      this.socket.disconnect();
    });
  }

  public connectSocket() {
    this.socket = io('http://localhost:3000');
    console.log(this.socket);
    this.initialiseListeners();
    return this.socket;
  }
}
