import { Cell, SquaresGameEngineService } from './squares-game-engine.service';

describe('SquaresGameEngineService', () => {
  const service = new SquaresGameEngineService();

  describe('createInitialCells', () => {
    it('creates gridSize² cells', () => {
      expect(service.createInitialCells(10).length).toBe(100);
    });

    it('assigns sequential ids starting from 0', () => {
      const cells = service.createInitialCells(2);
      expect(cells.map((c) => c.id)).toEqual([0, 1, 2, 3]);
    });

    it('sets every cell to idle', () => {
      expect(service.createInitialCells(10).every((c) => c.state === 'idle')).toBe(true);
    });
  });

  describe('clampDuration', () => {
    it('returns value unchanged when within range', () => {
      expect(service.clampDuration(500, 100, 10000)).toBe(500);
    });

    it('clamps to minimum', () => {
      expect(service.clampDuration(50, 100, 10000)).toBe(100);
    });

    it('clamps to maximum', () => {
      expect(service.clampDuration(20000, 100, 10000)).toBe(10000);
    });

    it('accepts boundary values without clamping', () => {
      expect(service.clampDuration(100, 100, 10000)).toBe(100);
      expect(service.clampDuration(10000, 100, 10000)).toBe(10000);
    });
  });

  describe('getIdleCellIndexes', () => {
    it('returns indexes of all idle cells', () => {
      const cells: Cell[] = [
        { id: 0, state: 'idle' },
        { id: 1, state: 'active' },
        { id: 2, state: 'idle' },
        { id: 3, state: 'player' },
      ];
      expect(service.getIdleCellIndexes(cells)).toEqual([0, 2]);
    });

    it('returns empty array when no idle cells remain', () => {
      const cells: Cell[] = [
        { id: 0, state: 'player' },
        { id: 1, state: 'computer' },
      ];
      expect(service.getIdleCellIndexes(cells)).toEqual([]);
    });
  });

  describe('pickRandomIndex', () => {
    it('returns null for an empty array', () => {
      expect(service.pickRandomIndex([])).toBeNull();
    });

    it('picks the first element when random returns 0', () => {
      expect(service.pickRandomIndex([5, 10, 15], () => 0)).toBe(5);
    });

    it('picks the last element when random approaches 1', () => {
      expect(service.pickRandomIndex([5, 10, 15], () => 0.99)).toBe(15);
    });

    it('returns the only element for a single-item array', () => {
      expect(service.pickRandomIndex([42], () => 0)).toBe(42);
    });
  });

  describe('setCellState', () => {
    it('updates the state of the specified cell', () => {
      const cells = service.createInitialCells(2);
      expect(service.setCellState(cells, 1, 'active')[1].state).toBe('active');
    });

    it('does not mutate the original array', () => {
      const cells = service.createInitialCells(2);
      service.setCellState(cells, 0, 'player');
      expect(cells[0].state).toBe('idle');
    });

    it('returns a new array reference', () => {
      const cells = service.createInitialCells(2);
      expect(service.setCellState(cells, 0, 'player')).not.toBe(cells);
    });

    it('returns a new object for the updated cell', () => {
      const cells = service.createInitialCells(2);
      expect(service.setCellState(cells, 0, 'player')[0]).not.toBe(cells[0]);
    });

    it('leaves unaffected cells unchanged by reference', () => {
      const cells = service.createInitialCells(3);
      const updated = service.setCellState(cells, 1, 'player');
      expect(updated[0]).toBe(cells[0]);
      expect(updated[2]).toBe(cells[2]);
    });
  });

  describe('resetCells', () => {
    it('resets all cells to idle state', () => {
      const cells: Cell[] = [
        { id: 0, state: 'player' },
        { id: 1, state: 'computer' },
        { id: 2, state: 'active' },
      ];
      expect(service.resetCells(cells).every((c) => c.state === 'idle')).toBe(true);
    });

    it('returns a new array', () => {
      const cells = service.createInitialCells(2);
      expect(service.resetCells(cells)).not.toBe(cells);
    });
  });

  describe('hasIdleCells', () => {
    it('returns true when at least one cell is idle', () => {
      const cells: Cell[] = [{ id: 0, state: 'idle' }, { id: 1, state: 'player' }];
      expect(service.hasIdleCells(cells)).toBe(true);
    });

    it('returns false when no cells are idle', () => {
      const cells: Cell[] = [{ id: 0, state: 'player' }, { id: 1, state: 'computer' }];
      expect(service.hasIdleCells(cells)).toBe(false);
    });
  });

  describe('resolveWinner', () => {
    it('returns Player when player score is higher', () => {
      expect(service.resolveWinner(10, 5)).toBe('Player');
    });

    it('returns Computer when computer score is higher', () => {
      expect(service.resolveWinner(3, 10)).toBe('Computer');
    });

    it('returns null for equal scores (draw)', () => {
      expect(service.resolveWinner(5, 5)).toBeNull();
    });
  });
});
