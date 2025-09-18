class OhHellScorekeeper {
    constructor() {
        this.players = [];
        this.currentRound = 1;
        this.trumpSuits = ['♠', '♥', '♦', '♣'];
        this.currentTrumpIndex = 0;
        this.gameActive = false;
        this.roundData = [];
        this.scores = {};
        this.gameHistory = []; // Store all round data
        this.maxCards = 0; // Maximum cards per player (for display purposes)
        this.isIncreasing = true; // Whether we're increasing or decreasing cards
        this.peakRound = 0; // The round number when we started decreasing
        this.peakCards = 0; // The number of cards when we started decreasing
        this.currentBiddingPlayer = 0;
        this.currentBid = null;
        this.commonNames = [
            'Ninad', 'Karan', 'Vishal', 'Neha', 'Tanvi', 'Digisha','Vashisht', 'Prerak', 'Baka', 'Vibhav', 
            'Nirmi', 'Kenil', 'Karan', 'Noah', 'Olivia', 'Paul',
            'Quinn', 'Ruby', 'Sam', 'Tina', 'Uma', 'Victor', 'Wendy', 'Xavier',
            'Yara', 'Zoe', 'Alex', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley'
        ];
        
        this.initializeEventListeners();
        this.populateCommonNames();
    }

    initializeEventListeners() {
        // Game setup
        document.getElementById('addPlayerNameBtn').addEventListener('click', () => this.addPlayer());
        document.getElementById('playerNameInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addPlayer();
        });
        document.getElementById('setupGameBtn').addEventListener('click', () => this.setupGame());
        document.getElementById('viewLeaderboardBtn').addEventListener('click', () => this.showDetailedLeaderboard());
        
        // Game setup phase
        document.getElementById('confirmOrderBtn').addEventListener('click', () => this.confirmPlayerOrder());
        document.getElementById('backToSetupBtn').addEventListener('click', () => this.backToSetup());
        
        // Bidding phase
        document.getElementById('confirmBidBtn').addEventListener('click', () => this.confirmBid());
        
        // Game controls
        document.getElementById('newGameBtn').addEventListener('click', () => this.newGame());
        document.getElementById('addPlayerBtn').addEventListener('click', () => this.showGameSetup());
        document.getElementById('nextRoundBtn').addEventListener('click', () => this.nextRound());
        document.getElementById('decreaseCardsBtn').addEventListener('click', () => this.startDecreasingCards());
        document.getElementById('completeGameBtn').addEventListener('click', () => this.completeGame());
        document.getElementById('viewLeaderboardInGameBtn').addEventListener('click', () => this.showDetailedLeaderboard());
        document.getElementById('newGameFromFinalBtn').addEventListener('click', () => this.newGame());
        document.getElementById('viewDetailedLeaderboardBtn').addEventListener('click', () => this.showDetailedLeaderboard());
        document.getElementById('backToGameBtn').addEventListener('click', () => this.backToGame());
    }

    populateCommonNames() {
        const container = document.getElementById('commonNames');
        this.commonNames.forEach(name => {
            const chip = document.createElement('span');
            chip.className = 'name-chip';
            chip.textContent = name;
            chip.addEventListener('click', () => {
                document.getElementById('playerNameInput').value = name;
                this.addPlayer();
            });
            container.appendChild(chip);
        });
    }

    addPlayer() {
        const input = document.getElementById('playerNameInput');
        const name = input.value.trim();
        
        if (!name) {
            alert('Please enter a player name');
            return;
        }
        
        if (this.players.includes(name)) {
            alert('Player already exists');
            return;
        }
        
        this.players.push(name);
        this.scores[name] = 0;
        input.value = '';
        this.updatePlayerList();
        this.updateSetupGameButton();
    }

    updatePlayerList() {
        const container = document.getElementById('playerList');
        container.innerHTML = '';
        
        this.players.forEach((player, index) => {
            const item = document.createElement('div');
            item.className = 'player-item';
            item.innerHTML = `
                <span>${player}</span>
                <button class="remove-btn" onclick="game.removePlayer(${index})">×</button>
            `;
            container.appendChild(item);
        });
    }

    removePlayer(index) {
        this.players.splice(index, 1);
        this.updatePlayerList();
        this.updateSetupGameButton();
    }

    updateSetupGameButton() {
        const btn = document.getElementById('setupGameBtn');
        btn.disabled = this.players.length < 2;
    }

    setupGame() {
        if (this.players.length < 2) {
            alert('Need at least 2 players to setup game');
            return;
        }
        
        this.maxCards = this.players.length;
        this.isIncreasing = true;
        this.currentRound = 1;
        this.currentTrumpIndex = 0;
        this.gameHistory = [];
        this.scores = {};
        this.players.forEach(player => this.scores[player] = 0);
        
        document.getElementById('gameSetup').style.display = 'none';
        document.getElementById('gameSetupPhase').style.display = 'block';
        
        this.createArrangedPlayers();
    }

    createArrangedPlayers() {
        const container = document.getElementById('arrangedPlayers');
        container.innerHTML = '';
        
        this.players.forEach((player, index) => {
            const playerDiv = document.createElement('div');
            playerDiv.className = 'arranged-player';
            playerDiv.draggable = true;
            playerDiv.dataset.playerIndex = index;
            playerDiv.innerHTML = `
                <i class="fas fa-grip-vertical"></i>
                <span>${player}</span>
            `;
            container.appendChild(playerDiv);
        });
        
        this.setupPlayerDragAndDrop();
    }

    setupPlayerDragAndDrop() {
        const players = document.querySelectorAll('.arranged-player');
        let draggedElement = null;
        
        players.forEach(player => {
            player.addEventListener('dragstart', (e) => {
                draggedElement = player;
                player.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            });
            
            player.addEventListener('dragend', () => {
                player.classList.remove('dragging');
                draggedElement = null;
            });
            
            player.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
            });
            
            player.addEventListener('drop', (e) => {
                e.preventDefault();
                if (draggedElement && draggedElement !== player) {
                    this.swapArrangedPlayers(
                        parseInt(draggedElement.dataset.playerIndex),
                        parseInt(player.dataset.playerIndex)
                    );
                }
            });
        });
    }

    swapArrangedPlayers(index1, index2) {
        [this.players[index1], this.players[index2]] = [this.players[index2], this.players[index1]];
        this.createArrangedPlayers();
    }

    confirmPlayerOrder() {
        // Show confirmation dialog
        const orderText = this.players.map((player, index) => `${index + 1}. ${player}`).join('\n');
        const confirmed = confirm(`Confirm player order:\n\n${orderText}\n\nIs this correct?`);
        
        if (confirmed) {
            this.startBiddingPhase();
        }
    }

    backToSetup() {
        document.getElementById('gameSetupPhase').style.display = 'none';
        document.getElementById('gameSetup').style.display = 'block';
    }

    startBiddingPhase() {
        this.currentBiddingPlayer = 0;
        this.roundData = this.players.map(player => ({
            player,
            bid: null,
            result: null,
            score: 0
        }));
        
        // Disable next round button during bidding
        document.getElementById('nextRoundBtn').disabled = true;
        document.getElementById('nextRoundBtn').innerHTML = '<i class="fas fa-forward"></i> Complete Bidding First';
        
        // Disable leaderboard button during bidding
        document.getElementById('viewLeaderboardInGameBtn').disabled = true;
        document.getElementById('viewLeaderboardInGameBtn').innerHTML = '<i class="fas fa-trophy"></i> Complete Bidding First';
        
        document.getElementById('gameSetupPhase').style.display = 'none';
        document.getElementById('biddingPhase').style.display = 'block';
        
        this.updateBiddingDisplay();
    }

    updateBiddingDisplay() {
        const cardsInHand = this.getCardsInHand();
        const currentPlayer = this.players[this.currentBiddingPlayer];
        
        document.getElementById('biddingRoundNumber').textContent = this.currentRound;
        document.getElementById('biddingTrumpSuit').textContent = this.trumpSuits[this.currentTrumpIndex];
        document.getElementById('cardsInHand').textContent = cardsInHand;
        document.getElementById('currentBiddingPlayer').textContent = this.currentBiddingPlayer + 1;
        document.getElementById('totalPlayers').textContent = this.players.length;
        document.getElementById('biddingPlayerName').textContent = currentPlayer;
        
        this.updateTrickSelector(cardsInHand);
        this.updateBiddingRestriction();
    }

    restoreBiddingPhase() {
        // Reinitialize the bidding phase properly
        this.updateBiddingDisplay();
        
        // Disable leaderboard button during bidding
        document.getElementById('viewLeaderboardInGameBtn').disabled = true;
        document.getElementById('viewLeaderboardInGameBtn').innerHTML = '<i class="fas fa-trophy"></i> Complete Bidding First';
        
        // Make sure the confirm bid button has its event listener
        const confirmBtn = document.getElementById('confirmBidBtn');
        if (confirmBtn) {
            // Remove any existing listeners and add fresh one
            confirmBtn.replaceWith(confirmBtn.cloneNode(true));
            document.getElementById('confirmBidBtn').addEventListener('click', () => this.confirmBid());
        }
        
        // Ensure trick selector buttons have their event listeners
        const trickButtons = document.querySelectorAll('.trick-btn');
        trickButtons.forEach(btn => {
            const tricks = parseInt(btn.dataset.tricks);
            btn.replaceWith(btn.cloneNode(true));
            document.querySelector(`[data-tricks="${tricks}"]`).addEventListener('click', () => this.selectTrick(tricks));
        });
        
        // Reset current bid state
        this.currentBid = null;
        document.getElementById('confirmBidBtn').disabled = true;
    }

    getCardsInHand() {
        if (this.isIncreasing) {
            // During increasing phase, cards = round number (no cap)
            return this.currentRound;
        } else {
            // During decreasing phase, cards decrease from the peak
            // Calculate how many rounds we've been decreasing
            const decreasingRound = this.currentRound - this.peakRound;
            return Math.max(1, this.peakCards - decreasingRound);
        }
    }

    updateTrickSelector(maxTricks) {
        const container = document.querySelector('.trick-selector');
        container.innerHTML = '';
        
        for (let i = 0; i <= maxTricks; i++) {
            const btn = document.createElement('button');
            btn.className = 'trick-btn';
            btn.dataset.tricks = i;
            btn.textContent = i;
            btn.addEventListener('click', () => this.selectTrick(i));
            container.appendChild(btn);
        }
        
        this.currentBid = null;
        document.getElementById('confirmBidBtn').disabled = true;
    }

    selectTrick(tricks) {
        // Remove previous selection
        document.querySelectorAll('.trick-btn').forEach(btn => btn.classList.remove('selected'));
        
        // Add selection to clicked button
        document.querySelector(`[data-tricks="${tricks}"]`).classList.add('selected');
        
        this.currentBid = tricks;
        document.getElementById('confirmBidBtn').disabled = false;
    }

    updateBiddingRestriction() {
        const restriction = document.getElementById('biddingRestriction');
        const totalBids = this.roundData.reduce((sum, data) => sum + (data.bid || 0), 0);
        const cardsInHand = this.getCardsInHand();
        const restrictedBid = cardsInHand - totalBids;
        
        if (this.currentBiddingPlayer === this.players.length - 1 && restrictedBid >= 0 && restrictedBid <= cardsInHand) {
            restriction.style.display = 'block';
            restriction.textContent = `⚠️ You cannot bid ${restrictedBid} (would make total equal to ${cardsInHand})`;
        } else {
            restriction.style.display = 'none';
        }
    }

    confirmBid() {
        if (this.currentBid === null) {
            alert('Please select how many tricks you will make');
            return;
        }
        
        // Check for invalid bid for last player
        const totalBids = this.roundData.reduce((sum, data) => sum + (data.bid || 0), 0);
        const cardsInHand = this.getCardsInHand();
        const restrictedBid = cardsInHand - totalBids;
        
        if (this.currentBiddingPlayer === this.players.length - 1 && this.currentBid === restrictedBid) {
            alert(`Invalid bid! You cannot bid ${this.currentBid} as it would make the total equal to ${cardsInHand}`);
            return;
        }
        
        this.roundData[this.currentBiddingPlayer].bid = this.currentBid;
        this.currentBiddingPlayer++;
        
        if (this.currentBiddingPlayer < this.players.length) {
            this.updateBiddingDisplay();
        } else {
            this.startGameBoard();
        }
    }

    startGameBoard() {
        document.getElementById('biddingPhase').style.display = 'none';
        document.getElementById('gameBoard').style.display = 'block';
        
        this.gameActive = true;
        this.createScoreTable();
        this.updateGameDisplay();
        this.updateDecreaseCardsButton();
        
        // Re-enable next round button now that bidding is complete
        this.updateNextRoundButton();
        
        // Re-enable leaderboard button now that bidding is complete
        document.getElementById('viewLeaderboardInGameBtn').disabled = false;
        document.getElementById('viewLeaderboardInGameBtn').innerHTML = '<i class="fas fa-trophy"></i> View Leaderboard';
    }

    createScoreTable() {
        const playerColumns = document.getElementById('playerColumns');
        
        // Clear existing content
        playerColumns.innerHTML = '';
        
        this.players.forEach((player, index) => {
            // Header with player info
            const headerCell = document.createElement('th');
            headerCell.className = 'player-column';
            headerCell.innerHTML = `
                <div class="player-info">
                    <div class="player-name">${player}</div>
                    <div class="player-bid" id="bid-${index}" onclick="game.toggleResult(${index})">
                        ${this.roundData[index] ? this.roundData[index].bid : '-'}
                    </div>
                    <i class="fas fa-grip-vertical drag-handle"></i>
                </div>
            `;
            headerCell.draggable = true;
            headerCell.dataset.playerIndex = index;
            playerColumns.appendChild(headerCell);
        });
        
        this.setupDragAndDrop();
        this.updateBidDisplays();
    }

    setupDragAndDrop() {
        const playerColumns = document.querySelectorAll('.player-column');
        let draggedElement = null;
        
        playerColumns.forEach(column => {
            column.addEventListener('dragstart', (e) => {
                draggedElement = column;
                e.dataTransfer.effectAllowed = 'move';
            });
            
            column.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
            });
            
            column.addEventListener('drop', (e) => {
                e.preventDefault();
                if (draggedElement && draggedElement !== column) {
                    this.swapPlayers(
                        parseInt(draggedElement.dataset.playerIndex),
                        parseInt(column.dataset.playerIndex)
                    );
                }
            });
        });
    }

    swapPlayers(index1, index2) {
        [this.players[index1], this.players[index2]] = [this.players[index2], this.players[index1]];
        [this.roundData[index1], this.roundData[index2]] = [this.roundData[index2], this.roundData[index1]];
        this.createScoreTable();
        this.updateGameDisplay();
    }

    toggleResult(playerIndex) {
        if (!this.roundData[playerIndex] || this.roundData[playerIndex].bid === null) {
            return; // No bid to toggle
        }
        
        // Toggle between success and failure
        if (this.roundData[playerIndex].result === null) {
            this.roundData[playerIndex].result = false; // Start with failure (red) for easier marking
        } else {
            this.roundData[playerIndex].result = !this.roundData[playerIndex].result; // Toggle
        }
        
        this.updateBidDisplays();
        this.updateNextRoundButton();
    }

    updateBidDisplays() {
        this.players.forEach((player, index) => {
            const bidElement = document.getElementById(`bid-${index}`);
            if (bidElement && this.roundData[index]) {
                const bid = this.roundData[index].bid;
                const result = this.roundData[index].result;
                
                bidElement.textContent = bid;
                bidElement.className = 'player-bid';
                
                if (result === true) {
                    bidElement.classList.add('success');
                } else if (result === false) {
                    bidElement.classList.add('failed');
                } else {
                    // Default to neutral state when result is null
                    bidElement.classList.add('neutral');
                }
            }
        });
    }

    updateNextRoundButton() {
        // Check if we're in bidding phase - if so, keep button disabled
        const isBiddingPhase = document.getElementById('biddingPhase').style.display !== 'none';
        if (isBiddingPhase) {
            document.getElementById('nextRoundBtn').disabled = true;
            document.getElementById('nextRoundBtn').innerHTML = '<i class="fas fa-forward"></i> Complete Bidding First';
            return;
        }
        
        // Check if all players have bids
        const allBidsSet = this.roundData.every(data => data.bid !== null && data.bid !== undefined);
        
        // Count marked results
        const markedResults = this.roundData.filter(data => data.result !== null);
        const successCount = this.roundData.filter(data => data.result === true).length;
        const failureCount = this.roundData.filter(data => data.result === false).length;
        
        // Enable next round if:
        // 1. All bids are set
        // 2. At least one player is marked (success or failure)
        // 3. Not everyone is marked as failed (at least one success or unmarked)
        const canProceed = allBidsSet && 
                          markedResults.length > 0 && 
                          (successCount > 0 || markedResults.length < this.roundData.length);
        
        document.getElementById('nextRoundBtn').disabled = !canProceed;
        
        // Update button text to be more helpful
        const nextBtn = document.getElementById('nextRoundBtn');
        if (!allBidsSet) {
            nextBtn.innerHTML = '<i class="fas fa-forward"></i> Complete Bidding First';
        } else if (markedResults.length === 0) {
            nextBtn.innerHTML = '<i class="fas fa-forward"></i> Mark Results (Click Bids)';
        } else if (failureCount === this.roundData.length) {
            nextBtn.innerHTML = '<i class="fas fa-forward"></i> Not Everyone Can Fail';
        } else {
            nextBtn.innerHTML = '<i class="fas fa-forward"></i> Next Round';
        }
    }

    updateGameDisplay() {
        document.getElementById('currentRound').textContent = this.currentRound;
        document.getElementById('cardsInHandDisplay').textContent = this.getCardsInHand();
        this.updateTrumpDisplay();
        this.updateScores();
    }

    updateDecreaseCardsButton() {
        const decreaseBtn = document.getElementById('decreaseCardsBtn');
        // Show button only when we're still in increasing phase and have at least reached the number of players
        if (this.isIncreasing && this.currentRound >= this.players.length) {
            decreaseBtn.style.display = 'inline-flex';
        } else {
            decreaseBtn.style.display = 'none';
        }
    }

    startDecreasingCards() {
        this.peakRound = this.currentRound;
        this.peakCards = this.currentRound; // Current cards = current round number
        this.isIncreasing = false;
        document.getElementById('decreaseCardsBtn').style.display = 'none';
        alert(`Now starting to decrease the number of cards! Next round will have ${this.peakCards - 1} cards per player.`);
    }

    updateTrumpDisplay() {
        const trumpDisplay = document.getElementById('trumpDisplay');
        const trumpSuit = document.getElementById('trumpSuit');
        const currentTrump = this.trumpSuits[this.currentTrumpIndex];
        
        trumpDisplay.textContent = currentTrump;
        trumpSuit.textContent = currentTrump;
    }

    updateScores() {
        // Scores are now only shown in the leaderboard, not in the main table
        // This method is kept for consistency but doesn't update any UI elements
    }

    nextRound() {
        // Calculate round scores
        this.calculateRoundScores();
        
        // Store round data in history
        this.gameHistory.push({
            round: this.currentRound,
            trump: this.trumpSuits[this.currentTrumpIndex],
            cardsInHand: this.getCardsInHand(),
            data: [...this.roundData]
        });
        
        // Show round summary
        this.showRoundSummary();
        
        // Move to next round
        this.currentRound++;
        this.currentTrumpIndex = (this.currentTrumpIndex + 1) % this.trumpSuits.length;
        
        // Always continue to next round - game only ends when user clicks "Complete Game"
        this.startBiddingPhase();
    }

    calculateRoundScores() {
        this.roundData.forEach(data => {
            const bid = data.bid;
            const result = data.result;
            let roundScore = 0;
            
            if (result === true) {
                // Made the bid - score is 10 + bid
                roundScore = 10 + bid;
            } else if (result === false) {
                // Failed the bid - score is 0
                roundScore = 0;
            } else {
                // Unmarked players - assume they made their bid (default to success)
                roundScore = 10 + bid;
            }
            
            data.score = roundScore;
            this.scores[data.player] += roundScore;
        });
    }

    showRoundSummary() {
        const summary = document.getElementById('roundSummary');
        const results = document.getElementById('roundResults');
        
        results.innerHTML = `
            <div class="round-results">
                <h4>Round ${this.currentRound} Results:</h4>
                ${this.roundData.map(data => {
                    let resultText = '';
                    if (data.result === true) {
                        resultText = 'Made';
                    } else if (data.result === false) {
                        resultText = 'Missed';
                    } else {
                        resultText = 'Made (unmarked)';
                    }
                    return `
                        <div class="result-item">
                            <strong>${data.player}:</strong> 
                            Bid ${data.bid}, ${resultText} 
                            (${data.score > 0 ? '+' : ''}${data.score} points)
                        </div>
                    `;
                }).join('')}
                <div class="round-total">
                    <strong>Round Total: ${this.roundData.reduce((sum, data) => sum + data.score, 0)} points</strong>
                </div>
            </div>
        `;
        
        summary.style.display = 'block';
        
        // Hide summary after 4 seconds
        setTimeout(() => {
            summary.style.display = 'none';
        }, 4000);
    }

    completeGame() {
        this.gameActive = false;
        document.getElementById('gameBoard').style.display = 'none';
        document.getElementById('finalScores').style.display = 'block';
        
        this.showFinalScores();
    }

    showFinalScores() {
        const leaderboard = document.getElementById('leaderboard');
        const sortedPlayers = this.players
            .map(player => ({ name: player, score: this.scores[player] }))
            .sort((a, b) => b.score - a.score);
        
        leaderboard.innerHTML = '';
        
        sortedPlayers.forEach((player, index) => {
            const item = document.createElement('div');
            item.className = 'leaderboard-item';
            
            let rankClass = '';
            if (index === 0) rankClass = 'first';
            else if (index === 1) rankClass = 'second';
            else if (index === 2) rankClass = 'third';
            
            item.className += ` ${rankClass}`;
            
            item.innerHTML = `
                <div class="leaderboard-rank">${index + 1}</div>
                <div class="leaderboard-name">${player.name}</div>
                <div class="leaderboard-score">${player.score} pts</div>
            `;
            
            leaderboard.appendChild(item);
        });
    }

    showDetailedLeaderboard() {
        if (this.gameHistory.length === 0) {
            alert('No game data available yet');
            return;
        }
        
        // Store current view to return to
        this.previousView = this.getCurrentView();
        
        // Also store if we're in bidding phase for better detection
        this.wasInBiddingPhase = this.isInBiddingPhase();
        
        document.getElementById('gameSetup').style.display = 'none';
        document.getElementById('gameSetupPhase').style.display = 'none';
        document.getElementById('biddingPhase').style.display = 'none';
        document.getElementById('gameBoard').style.display = 'none';
        document.getElementById('finalScores').style.display = 'none';
        document.getElementById('detailedLeaderboard').style.display = 'block';
        
        this.createDetailedTable();
    }

    getCurrentView() {
        if (document.getElementById('gameBoard').style.display !== 'none') return 'gameBoard';
        if (document.getElementById('finalScores').style.display !== 'none') return 'finalScores';
        if (document.getElementById('biddingPhase').style.display !== 'none') return 'biddingPhase';
        if (document.getElementById('gameSetupPhase').style.display !== 'none') return 'gameSetupPhase';
        return 'gameSetup';
    }

    isInBiddingPhase() {
        return document.getElementById('biddingPhase').style.display !== 'none';
    }

    createDetailedTable() {
        const headersRow = document.getElementById('detailedTableHeaders');
        const body = document.getElementById('detailedTableBody');
        
        // Remove existing round headers (keep Player and Total headers)
        const playerHeader = headersRow.querySelector('th:first-child');
        const totalHeader = headersRow.querySelector('th:last-child');
        headersRow.innerHTML = '';
        headersRow.appendChild(playerHeader);
        
        // Create round headers
        this.gameHistory.forEach(round => {
            const th = document.createElement('th');
            th.textContent = `R${round.round}`;
            headersRow.appendChild(th);
        });
        
        // Re-add the total header at the end
        headersRow.appendChild(totalHeader);
        
        // Create body
        body.innerHTML = '';
        this.players.forEach(player => {
            const row = document.createElement('tr');
            
            // Player name
            const nameCell = document.createElement('td');
            nameCell.textContent = player;
            nameCell.style.fontWeight = 'bold';
            row.appendChild(nameCell);
            
            // Round scores
            let totalScore = 0;
            this.gameHistory.forEach(round => {
                const roundData = round.data.find(data => data.player === player);
                const score = roundData ? roundData.score : 0;
                totalScore += score;
                
                const scoreCell = document.createElement('td');
                scoreCell.className = 'round-score';
                scoreCell.textContent = score;
                
                if (score > 0) scoreCell.classList.add('positive');
                else if (score < 0) scoreCell.classList.add('negative');
                else scoreCell.classList.add('zero');
                
                row.appendChild(scoreCell);
            });
            
            // Total score
            const totalCell = document.createElement('td');
            totalCell.className = 'total-score';
            totalCell.textContent = totalScore;
            if (totalScore === Math.max(...this.players.map(p => this.scores[p]))) {
                totalCell.classList.add('winner');
            }
            row.appendChild(totalCell);
            
            body.appendChild(row);
        });
    }

    backToGame() {
        document.getElementById('detailedLeaderboard').style.display = 'none';
        
        // Return to the previous view
        const previousView = this.previousView || (this.gameActive ? 'gameBoard' : 'finalScores');
        document.getElementById(previousView).style.display = 'block';
        
        // Always check if we're in bidding phase after showing the view
        setTimeout(() => {
            if (this.isInBiddingPhase() || this.wasInBiddingPhase) {
                this.restoreBiddingPhase();
            } else if (previousView === 'gameBoard') {
                this.createScoreTable();
                this.updateGameDisplay();
                this.updateDecreaseCardsButton();
                this.updateNextRoundButton();
            }
        }, 10); // Small delay to ensure DOM is updated
    }

    showGameSetup() {
        document.getElementById('gameSetup').style.display = 'block';
        document.getElementById('gameSetupPhase').style.display = 'none';
        document.getElementById('biddingPhase').style.display = 'none';
        document.getElementById('gameBoard').style.display = 'none';
        document.getElementById('finalScores').style.display = 'none';
        document.getElementById('detailedLeaderboard').style.display = 'none';
    }

    newGame() {
        this.players = [];
        this.currentRound = 1;
        this.currentTrumpIndex = 0;
        this.gameActive = false;
        this.roundData = [];
        this.gameHistory = [];
        this.scores = {};
        this.maxCards = 0;
        this.isIncreasing = true;
        this.peakRound = 0;
        this.peakCards = 0;
        this.currentBiddingPlayer = 0;
        this.currentBid = null;
        
        document.getElementById('playerNameInput').value = '';
        document.getElementById('playerList').innerHTML = '';
        document.getElementById('roundSummary').style.display = 'none';
        
        this.showGameSetup();
        this.updateSetupGameButton();
    }
}

// Initialize the game when the page loads
const game = new OhHellScorekeeper();