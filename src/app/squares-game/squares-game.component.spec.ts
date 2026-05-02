import { fireEvent, render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SquaresGameComponent } from './squares-game.component';

const TURN_DURATION_MS = 1000;
const TARGET_SCORE = 10;

function getStartButton() {
  return screen.getByRole('button', { name: 'Start' });
}

function getCells() {
  return screen.getAllByRole('button', { name: /^Cell \d+$/ });
}

function getActiveCell() {
  return getCells().find((c) => !c.hasAttribute('disabled')) ?? null;
}

describe('SquaresGameComponent', () => {
  afterEach(() => vi.useRealTimers());

  describe('initial state', () => {
    it('renders the game title', async () => {
      await render(SquaresGameComponent);
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Interactive Mini-Game');
    });

    it('renders 100 cells', async () => {
      await render(SquaresGameComponent);
      expect(getCells()).toHaveLength(100);
    });

    it('disables all cells before the game starts', async () => {
      await render(SquaresGameComponent);
      expect(getCells().every((c) => c.hasAttribute('disabled'))).toBe(true);
    });

    it('shows zero scores for both sides', async () => {
      await render(SquaresGameComponent);
      expect(screen.getByText('Player').nextElementSibling).toHaveTextContent('0');
      expect(screen.getByText('Computer').nextElementSibling).toHaveTextContent('0');
    });

    it('renders the N input with the default value', async () => {
      await render(SquaresGameComponent);
      expect(screen.getByLabelText(/N \(milliseconds\)/i)).toHaveValue(TURN_DURATION_MS);
    });
  });

  describe('starting the game', () => {
    it('enables exactly one cell after clicking Start', async () => {
      vi.useFakeTimers();
      await render(SquaresGameComponent);

      fireEvent.click(getStartButton());

      expect(getCells().filter((c) => !c.hasAttribute('disabled'))).toHaveLength(1);
    });
  });

  describe('player turn', () => {
    it('increments the player score when the active cell is clicked in time', async () => {
      vi.useFakeTimers();
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      await render(SquaresGameComponent);
      fireEvent.click(getStartButton());

      await user.click(getActiveCell()!);

      expect(screen.getByText('Player').nextElementSibling).toHaveTextContent('1');
    });

    it('marks the clicked cell green', async () => {
      vi.useFakeTimers();
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      await render(SquaresGameComponent);
      fireEvent.click(getStartButton());

      const active = getActiveCell()!;
      await user.click(active);

      expect(active).toHaveClass('cell--player');
    });
  });

  describe('computer turn', () => {
    it('increments the computer score when time expires', async () => {
      vi.useFakeTimers();
      const { fixture } = await render(SquaresGameComponent);
      fireEvent.click(getStartButton());

      vi.advanceTimersByTime(TURN_DURATION_MS + 50);
      fixture.detectChanges();

      expect(screen.getByText('Computer').nextElementSibling).toHaveTextContent('1');
    });

    it('marks the expired cell red', async () => {
      vi.useFakeTimers();
      const { fixture } = await render(SquaresGameComponent);
      fireEvent.click(getStartButton());
      const cellBeforeTimeout = getActiveCell()!;

      vi.advanceTimersByTime(TURN_DURATION_MS + 50);
      fixture.detectChanges();

      expect(cellBeforeTimeout).toHaveClass('cell--computer');
    });
  });

  describe('game over', () => {
    async function playUntilComputerWins() {
      vi.useFakeTimers();
      const { fixture } = await render(SquaresGameComponent);
      fireEvent.click(getStartButton());
      for (let i = 0; i < TARGET_SCORE; i++) {
        vi.advanceTimersByTime(TURN_DURATION_MS + 50);
        fixture.detectChanges();
      }
      return { fixture };
    }

    it('shows a game over modal when a score reaches the target', async () => {
      await playUntilComputerWins();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('shows the correct winner in the modal', async () => {
      await playUntilComputerWins();
      expect(screen.getByRole('dialog')).toHaveTextContent('Computer wins!');
    });

    it('closes the modal when the Close button is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const { fixture } = await playUntilComputerWins();

      await user.click(screen.getByRole('button', { name: 'Close' }));
      fixture.detectChanges();

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('moves focus to the Start button when the modal is closed', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const { fixture } = await playUntilComputerWins();

      await user.click(screen.getByRole('button', { name: 'Close' }));
      fixture.detectChanges();

      expect(getStartButton()).toHaveFocus();
    });
  });

  describe('input validation', () => {
    it('clamps the duration to the minimum on blur', async () => {
      const user = userEvent.setup();
      await render(SquaresGameComponent);
      const input = screen.getByLabelText(/N \(milliseconds\)/i);

      await user.clear(input);
      await user.type(input, '10');
      await user.tab();

      expect(input).toHaveValue(100);
    });

    it('clamps the duration to the maximum on blur', async () => {
      const user = userEvent.setup();
      await render(SquaresGameComponent);
      const input = screen.getByLabelText(/N \(milliseconds\)/i);

      await user.clear(input);
      await user.type(input, '99999');
      await user.tab();

      expect(input).toHaveValue(10000);
    });
  });
});
