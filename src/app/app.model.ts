export interface ProbItem {
    cell: ICells,
    probability: number
}

export enum Player {
    'PLAYER1' = 'Player-1',
    'PLAYER2' = 'Player-2',
    'COMPUTER' = 'Computer'
  }
  
  export enum Marker {
    X = 'X',
    O = 'O',
    NA = 'NA'
  }
  
  export interface ICells {
    id: string;
    mark: Marker;
  }
  
  export enum Mode {
    MULTI = 'multi',
    COMPUTER = 'computer',
    NA = 'NA'
  }
  
  export enum Result {
    GAMEOVER = 'GAMEOVER',
    TIE = 'TIE'
  }
  
  export enum GameState {
    GAMEOVER = 'GAMEOVER',
    TIE = 'TIE',
    ON = 'ON',
    OFF = 'OFF',
    PENDING = 'PENDING'
  }
  