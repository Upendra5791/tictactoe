import { Injectable } from '@angular/core';
import { ICells, Marker, ProbItem } from './app.model';
import { IState } from './store/reducer';
import { Store } from '@ngrx/store';
import { getMovesCount } from './store/selector';

@Injectable()
export class NextMove {
  public readonly startCells = this.populateCells();
  private readonly winningCombo = [
    {
      combo: ['11', '12', '13'],
      probability: 0,
    },
    {
      combo: ['21', '22', '23'],
      probability: 0,
    },
    {
      combo: ['31', '32', '33'],
      probability: 0,
    },
    {
      combo: ['11', '21', '31'],
      probability: 0,
    },
    {
      combo: ['12', '22', '32'],
      probability: 0,
    },
    {
      combo: ['13', '23', '33'],
      probability: 0,
    },
    {
      combo: ['11', '22', '33'],
      probability: 0,
    },
    {
      combo: ['13', '22', '31'],
      probability: 0,
    },
  ];
  public deepClone(originalArr: any) {
    return JSON.parse(JSON.stringify(originalArr));
  }

  private probList: ProbItem[] = [];
  public movesCount = 0;
  constructor(private store: Store<IState>) {
    this.store.select(getMovesCount).subscribe((movesCount) => (this.movesCount = movesCount));
  }

  public populateCells(): ICells[] {
    const arr = [];
    for (let i = 1; i <= 3; i++) {
      for (let j = 1; j <= 3; j++) {
        arr.push({
          id: `${i}${j}`,
          mark: Marker.NA,
        });
      }
    }
    return arr;
  }

  public checkBoard(board: ICells[]) {
    let gameWin;
    this.probList = [];
    let currentBoard: ICells[] = this.deepClone(board);
    const availableCells = currentBoard.filter(
      (f: { mark: any }) => f.mark === Marker.NA
    );
    let f_availableCells: ICells[] = this.deepClone(availableCells);
    f_availableCells.forEach((cell: ICells) => {
      cell.mark = Marker.O;
      const currentBoardCell = currentBoard.find((f) => f.id === cell.id);
      if (!!currentBoardCell) currentBoardCell.mark = Marker.O;
      this.calculateWinProbability(currentBoard);
      this.additionalCheck(currentBoard);
      const probItem = {
        cell: cell,
        probability: this.getMaxProbValue(this.winningCombo),
      };
      probItem.probability += this.winningCombo.filter(
        (f) => !!f.probability
      ).length;
      this.probList.push(probItem);
      // check game win for computer as computer = O
      gameWin = this.checkIfGameWin(Marker.O, board);
      this.winningCombo.forEach((f) => (f.probability = 0));
      f_availableCells = this.deepClone(availableCells);
      currentBoard = this.deepClone(board);
    });
    if (!!gameWin) return { cell: gameWin };
    // check game win for Player 1 as Player 1  = X
    gameWin = this.checkIfGameWin(Marker.X, board);
    if (!!gameWin) return { cell: gameWin };
    return this.getCellwithMaxProbability();
  }

  public calculateWinProbability(currentBoard: ICells[]) {
    let probability = 0;
    const computerCells = currentBoard
      .filter((f) => f.mark === Marker.O)
      .map((m: { id: any }) => m.id);
    this.winningCombo.forEach((w) => {
      probability = 0;
      w.combo.forEach((w1) => {
        if (computerCells.includes(w1)) {
          probability++;
        }
      });
      w.probability = probability;
      probability = 0;
    });
  }

  public getMaxProbValue(arr: any[]) {
    const ids = arr.map((object: { probability: any }) => {
      return object.probability;
    });
    const max = Math.max(...ids);
    return max;
  }

  public getCellwithMaxProbability() {
    // select random cell when its the first move by computer
    if (!this.movesCount) {
      return this.probList[Math.floor(Math.random() * this.probList.length)];
    }
    const maxVal = this.getMaxProbValue(this.probList);
    return this.probList.find((f) => f.probability === maxVal);
  }

  public additionalCheck(currentBoard: any[]) {
    for (let i = 0; i < this.winningCombo.length; i++) {
      const c = this.winningCombo[i];
      // this.winningCombo.forEach((c) => {
      if (!!c.probability) {
        const currentMarkings = c.combo.map(
          (m) => currentBoard.find((f) => f.id === m).mark
        );
        if (currentMarkings.indexOf(Marker.X) > -1) {
          c.probability = 0;
          break;
        }
        if (currentMarkings.indexOf(Marker.NA) > -1) {
          c.probability++;
        }
        if (currentMarkings.indexOf(Marker.X) > -1) {
          c.probability += 2;
        }
      }
    }
  }

  public checkIfGameWin(marker: Marker, board: ICells[]) {
    let winCombo;
    let retCell;
    for (let i = 0; i < this.winningCombo.length; i++) {
      const c = this.winningCombo[i];
      const currentMarkings = c.combo.map(
        (m) => board.find(f => f.id === m)?.mark
      );
      if (
        currentMarkings.filter((f) => f === marker).length === 2 &&
        currentMarkings.indexOf(Marker.NA) > -1
      ) {
        winCombo = c.combo;
        break;
      }
    }
    if (winCombo) {
      const mId = winCombo.find(
        (f) => board.find(r => r.id === f)?.mark === Marker.NA
      );
      retCell = board.find(f => f.id === mId);
    }
    return retCell;
  }
}
