import { Component } from '@angular/core';
import { Cell, Mark, Mode } from './app.model';
import { NextMove } from './next-move.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  constructor(private moveService: NextMove) {}
  public mode!: Mode;
  public Player1: Mark = 'Player-1';
  public Player2: Mark = 'Player-2';
  public currentTurn: Mark = this.Player1;
  public lastTurn!: Mark;
  public gameOver = false;
  public gameTie = false;
  private readonly startCells = this.moveService.startCells;
  public cells: Cell[] = [];

  selectMode(mode: Mode): void {
    this.mode = mode;
    this.Player2 = this.mode === 'multi' ? 'Player-2' : 'Computer';
    this.startGame();
  }

  startGame(): void {
    this.cells = this.moveService.deepClone(this.startCells);
    this.gameOver = false;
    this.gameTie = false;
    this.moveService.clicks = 0;
    this.currentTurn = this.Player1;
    if (this.lastTurn === this.Player1) {
      this.swapTurn();
    }
    this.lastTurn = this.currentTurn;
  }

  markCell(id: any): void {
    this.moveService.clicks++;
    if (this.gameOver) return;
    const markedCell = this.cells.find((f: any) => f.id === id);
    if (markedCell?.mark === '') {
      markedCell.mark = this.currentTurn;
      this.checkForGame();
      if (this.gameOver) return;
      if (this.moveService.clicks === 9) {
        this.gameTie = true;
        return;
      }
      this.swapTurn();
    }
  }

  swapTurn(): void {
    this.currentTurn =
      this.currentTurn === this.Player1 ? this.Player2 : this.Player1;
    if (this.mode === 'computer' && this.currentTurn === this.Player2) {
      const cellToMark = this.moveService.checkBoard(this.cells);
      // only to emulate real user
      setTimeout(() => {
        this.markCell(cellToMark?.cell.id);
      }, 200);
    }
  }

  checkForGame(): boolean {
    for (let i = 1; i <= 3; i++) {
      this.gameOver = this.checkCells(
        this.cells.filter((f) => f.id.startsWith(String(i)))
      );
      if (this.gameOver) return this.gameOver;
      this.gameOver = this.checkCells(
        this.cells.filter((f) => f.id.endsWith(String(i)))
      );
      if (this.gameOver) return this.gameOver;
    }

    this.gameOver = this.checkCells(
      this.cells.filter((f) => f.id == '11' || f.id == '22' || f.id == '33')
    );
    if (this.gameOver) return this.gameOver;

    this.gameOver = this.checkCells(
      this.cells.filter((f) => f.id == '13' || f.id == '22' || f.id == '31')
    );
    if (this.gameOver) return this.gameOver;
    return false;
  }

  checkCells(cells: any[]): boolean {
    return (
      cells.every((f: { mark: string; }) => f.mark === this.Player1) ||
      cells.every((f: { mark: string; }) => f.mark === this.Player2)
    );
  }

  goHome(): void {
    this.mode = undefined;
    this.startGame();
  }
}
