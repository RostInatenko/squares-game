import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  OnDestroy,
  ViewChild,
  inject,
  signal
} from '@angular/core';
import {
  Cell,
  CellState,
  SquaresGameEngineService,
  Winner
} from './squares-game-engine.service';

@Component({
  selector: 'app-squares-game',
  standalone: true,
  templateUrl: './squares-game.html',
  styleUrl: './squares-game.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SquaresGameEngineService]
})
export class SquaresGameComponent implements OnDestroy {
  private readonly gameEngine = inject(SquaresGameEngineService);
  private readonly injector = inject(Injector);

  @ViewChild('startBtn') private startBtn?: ElementRef<HTMLButtonElement>;
  @ViewChild('closeBtn') private closeBtn?: ElementRef<HTMLButtonElement>;

  protected readonly gridSize = 10;
  protected readonly targetScore = 10;
  protected readonly minTurnTime = 100;
  protected readonly maxTurnTime = 10000;

  protected readonly turnDurationMs = signal(1000);
  protected readonly playerScore = signal(0);
  protected readonly computerScore = signal(0);
  protected readonly gameStarted = signal(false);
  protected readonly gameOver = signal(false);
  protected readonly winner = signal<Winner>(null);

  protected readonly cells = signal<Cell[]>(this.gameEngine.createInitialCells(this.gridSize));

  private activeCellIndex: number | null = null;
  private turnTimeoutId: ReturnType<typeof setTimeout> | null = null;

  ngOnDestroy(): void {
    this.clearTurnTimeout();
  }

  protected startGame(): void {
    this.turnDurationMs.update((v) => this.gameEngine.clampDuration(v, this.minTurnTime, this.maxTurnTime));
    this.clearTurnTimeout();
    this.resetBoardAndScores();
    this.gameStarted.set(true);
    this.gameOver.set(false);
    this.winner.set(null);
    this.startNextTurn();
  }

  protected onDurationInput(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    if (!Number.isNaN(value)) {
      this.turnDurationMs.set(value);
    }
  }

  protected onDurationBlur(): void {
    this.turnDurationMs.update((v) => this.gameEngine.clampDuration(v, this.minTurnTime, this.maxTurnTime));
  }

  protected onCellClick(index: number): void {
    if (!this.gameStarted() || this.gameOver() || this.activeCellIndex !== index) {
      return;
    }

    this.clearTurnTimeout();
    this.markCell(index, 'player');
    this.playerScore.update((score) => score + 1);

    this.tryFinishGame();
    if (!this.gameOver()) {
      this.startNextTurn();
    }
  }

  protected closeModal(): void {
    this.gameOver.set(false);
    this.startBtn?.nativeElement.focus();
  }

  private startNextTurn(): void {
    const nextActiveCell = this.gameEngine.pickRandomIndex(this.gameEngine.getIdleCellIndexes(this.cells()));
    if (nextActiveCell === null) {
      this.finishGameByScore();
      return;
    }

    this.activeCellIndex = nextActiveCell;
    this.markCell(nextActiveCell, 'active');

    this.turnTimeoutId = setTimeout(() => {
      this.markCell(nextActiveCell, 'computer');
      this.computerScore.update((score) => score + 1);
      this.activeCellIndex = null;
      this.tryFinishGame();
      if (!this.gameOver()) {
        this.startNextTurn();
      }
    }, this.turnDurationMs());
  }

  private tryFinishGame(): void {
    if (this.playerScore() >= this.targetScore || this.computerScore() >= this.targetScore) {
      this.finishGameByScore();
      return;
    }

    const hasRemainingIdleCells = this.gameEngine.hasIdleCells(this.cells());
    if (!hasRemainingIdleCells) {
      this.finishGameByScore();
    }
  }

  private finishGameByScore(): void {
    this.clearTurnTimeout();
    this.activeCellIndex = null;
    this.gameStarted.set(false);
    this.gameOver.set(true);
    this.winner.set(this.gameEngine.resolveWinner(this.playerScore(), this.computerScore()));
    afterNextRender(() => this.closeBtn?.nativeElement.focus(), { injector: this.injector });
  }

  private markCell(index: number, state: CellState): void {
    this.cells.update((cells) => this.gameEngine.setCellState(cells, index, state));
  }

  private resetBoardAndScores(): void {
    this.playerScore.set(0);
    this.computerScore.set(0);
    this.activeCellIndex = null;
    this.cells.update((cells) => this.gameEngine.resetCells(cells));
  }

  private clearTurnTimeout(): void {
    if (this.turnTimeoutId) {
      clearTimeout(this.turnTimeoutId);
      this.turnTimeoutId = null;
    }
  }
}
