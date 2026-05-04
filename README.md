# Interactive Mini-Game

A real-time reaction game built with Angular 21. A cell lights up on a 10×10 grid — click it before the timer expires. First to 10 points wins.

## Prerequisites

- [Node.js](https://nodejs.org/) v22 or later
- npm v10 or later (bundled with Node.js)

## Getting started

```bash
# Install dependencies
npm install

# Start the dev server
npm start
```

Open [http://localhost:4200](http://localhost:4200) in your browser. The page reloads automatically when you save a file.

## Available commands

| Command | Description |
|---|---|
| `npm start` | Start the dev server at localhost:4200 |
| `npm test` | Run unit tests with Vitest |
| `npm run build` | Production build → `dist/squares-game/browser/` |
| `npm run watch` | Dev build that rebuilds on file changes |

## Deployment

The app is deployed to GitHub Pages automatically on every push to `main` via the workflow in `.github/workflows/deploy.yml`.

Live URL: https://rostinatenko.github.io/squares-game/

To trigger a deploy manually, push any commit to `main`.
