import { Injectable } from '@angular/core';

export type CellState = 'idle' | 'active' | 'player' | 'computer';
export type Winner = 'Player' | 'Computer' | null;

export interface Cell {
  id: number;
  state: CellState;
}

@Injectable({
  providedIn: 'root'
})
export class SquaresGameEngineService {
  createInitialCells(gridSize: number): Cell[] {
    return Array.from({ length: gridSize * gridSize }, (_, index) => ({
      id: index,
      state: 'idle'
    }));
  }

  clampDuration(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
  }

  getIdleCellIndexes(cells: Cell[]): number[] {
    const idleIndexes: number[] = [];
    for (let index = 0; index < cells.length; index += 1) {
      if (cells[index].state === 'idle') {
        idleIndexes.push(index);
      }
    }

    return idleIndexes;
  }

  pickRandomIndex(indexes: number[], random: () => number = Math.random): number | null {
    if (indexes.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(random() * indexes.length);
    return indexes[randomIndex];
  }

  setCellState(cells: Cell[], index: number, state: CellState): Cell[] {
    const nextCells = [...cells];
    nextCells[index] = { ...nextCells[index], state };
    return nextCells;
  }

  resetCells(cells: Cell[]): Cell[] {
    return cells.map((cell) => ({ ...cell, state: 'idle' }));
  }

  hasIdleCells(cells: Cell[]): boolean {
    return cells.some((cell) => cell.state === 'idle');
  }

  resolveWinner(playerScore: number, computerScore: number): Winner {
    if (playerScore === computerScore) {
      return null;
    }

    return playerScore > computerScore ? 'Player' : 'Computer';
  }
}
