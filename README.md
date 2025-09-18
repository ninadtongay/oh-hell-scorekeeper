# Oh Hell Scorekeeper

A digital scorekeeper for the Oh Hell card game, built with vanilla HTML, CSS, and JavaScript.

## Features

- **Dynamic Player Management**: Add and arrange players in any order
- **Flexible Card Distribution**: Cards increase each round until you choose to start decreasing
- **Intelligent Bidding System**: Prevents invalid bids that would make totals equal to cards in hand
- **Interactive Score Tracking**: Click player bids to mark success/failure
- **Detailed Leaderboard**: View round-by-round scores and totals
- **Drag & Drop Interface**: Rearrange players during setup and gameplay

## How to Use

1. **Setup**: Add player names and arrange them in playing order
2. **Bidding**: Each player bids on tricks they'll make each round
3. **Scoring**: Click on player bids to toggle between success (green) and failure (red)
4. **Progress**: Continue rounds with increasing cards until you choose to decrease
5. **Complete**: End the game anytime to see final scores

## Game Rules

- Cards start at 1 per player and increase each round
- Click "Start Decreasing Cards" when ready to reduce cards each round
- Players bid on how many tricks they'll take
- Last player cannot bid if it makes the total equal to cards in hand
- Success: 10 + bid points | Failure: 0 points

## Live Demo

[Play the game here!](https://ohhellsk.netlify.app/)

## Technology

- Pure HTML5, CSS3, and JavaScript
- No external dependencies
- Responsive design for mobile and desktop
- Local storage for game persistence (future feature)

## Installation

Simply clone and open `index.html` in any modern web browser.

```bash
git clone https://github.com/ninadtongay/oh-hell-scorekeeper.git
cd oh-hell-scorekeeper
open index.html
```

## Contributing


Feel free to submit issues and pull requests to improve the scorekeeper!
