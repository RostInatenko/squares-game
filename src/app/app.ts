import { Component } from '@angular/core';
import { SquaresGameComponent } from './squares-game/squares-game.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SquaresGameComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
