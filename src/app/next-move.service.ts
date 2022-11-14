import { Injectable } from '@angular/core';
import { Cell, Mark, ProbItem } from './app.model';

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
  public clicks = 0;
  public deepClone(originalArr: any[]): any[] {
    return JSON.parse(JSON.stringify(originalArr));
  }

  private probList: ProbItem[] = [];

  populateCells(): Cell[] {
    const arr: Cell[] = [];
    for (let i = 1; i <= 3; i++) {
      for (let j = 1; j <= 3; j++) {
        arr.push({
          id: `${i}${j}`,
          mark: '',
        });
      }
    }
    return arr;
  }

  checkBoard(board: Cell[]) {
    let gameWin;
    this.probList = [];
    let currentBoard = this.deepClone(board);
    const availableCells = currentBoard.filter((f) => !f.mark);
    let f_availableCells = this.deepClone(availableCells);
    f_availableCells.forEach((cell) => {
      cell.mark = 'Computer';
      currentBoard.find((f) => f.id === cell.id).mark = 'Computer';
      this.calculateWinProbability(currentBoard);
      this.additionalCheck(currentBoard);
      const probItem: ProbItem = {
        cell: cell,
        probability: this.getMaxProbValue(this.winningCombo),
      };
      probItem.probability += this.winningCombo.filter(
        (f) => !!f.probability
      ).length;
      this.probList.push(probItem);
      gameWin = this.checkIfGameWin('Computer', board);
      this.winningCombo.forEach((f) => (f.probability = 0));
      f_availableCells = this.deepClone(availableCells);
      currentBoard = this.deepClone(board);
    });
    if (!!gameWin) return { cell: gameWin };
    gameWin = this.checkIfGameWin('Player-1', board);
    if (!!gameWin) return { cell: gameWin };
    return this.getCellwithMaxProbability();
  }

  calculateWinProbability(currentBoard: Cell[]) {
    let probability = 0;
    const computerCells = currentBoard
      .filter((f) => f.mark === 'Computer')
      .map((m) => m.id);
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

  getMaxProbValue(arr: any[]): number {
    const ids = arr.map((object) => {
      return object.probability;
    });
    const max = Math.max(...ids);
    return max;
  }

  getCellwithMaxProbability(): ProbItem | undefined {
    // select random cell when its the first move by computer
    if (!this.clicks) {
      return this.probList[Math.floor(Math.random() * this.probList.length)];
    }
    const maxVal = this.getMaxProbValue(this.probList);
    return this.probList.find((f) => f.probability === maxVal);
  }

  additionalCheck(currentBoard: any[]): void {
    for (let i = 0; i < this.winningCombo.length; i++) {
      const c = this.winningCombo[i];
      // this.winningCombo.forEach((c) => {
      if (!!c.probability) {
        const currentMarkings = c.combo.map(
          (m) => currentBoard.find((f) => f.id === m).mark
        );
        if (currentMarkings.indexOf('Player-1') > -1) {
          c.probability = 0;
          break;
        }
        if (currentMarkings.indexOf('') > -1) {
          c.probability++;
        }
        if (currentMarkings.indexOf('Computer') > -1) {
          c.probability += 2;
        }
      }
    }
  }

  checkIfGameWin(player: Mark, board: any[]): Cell {
    let winCombo;
    let retCell;
    for (let i = 0; i < this.winningCombo.length; i++) {
      const c = this.winningCombo[i];
      const currentMarkings = c.combo.map(
        (m) => board.find((f) => f.id === m).mark
      );
      if (
        currentMarkings.filter((f) => f === player).length === 2 &&
        currentMarkings.indexOf('') > -1
      ) {
        winCombo = c.combo;
        break;
      }
    }
    if (winCombo) {
      const mId = winCombo.find(
        (f) => board.find((r) => r.id === f).mark === ''
      );
      retCell = board.find((f) => f.id === mId);
    }
    return retCell;
  }
}
