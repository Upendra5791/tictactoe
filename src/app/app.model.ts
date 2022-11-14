export type Mark = 'Player-1' | 'Player-2' | 'Computer' | '';
export type Mode = 'multi' | 'computer' | undefined;

export interface Cell {
    id: string,
    mark: Mark
}

export interface ProbItem {
    cell: Cell,
    probability: number
}