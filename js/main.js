// Game Constants
const GAME_CONFIG = {
    STARTING_BALANCE: 100,
    STARTING_JACKPOT: 10000,
    TICKET_PRICE: 5,
    POWER_PLAY_COST: 2,
    NUMBER_RANGE: { min: 1, max: 35 },
    NUMBERS_TO_PICK: 6,
    JACKPOT_GROWTH_RATE: 0.3,
    STORAGE_KEY: 'lottoGameState'
};

const PRIZE_STRUCTURE = {
    2: 5,
    3: 25,
    4: 100,
    5: 1000
};

// Game State Management
class GameState {
    constructor() {
        this.reset();
        this.load();
    }

    reset() {
        this.balance = GAME_CONFIG.STARTING_BALANCE;
        this.jackpot = GAME_CONFIG.STARTING_JACKPOT;
        this.gamesPlayed = 0;
        this.totalWins = 0;
        this.biggestWin = 0;
        this.winStreak = 0;
        this.lastWin = 0;
        this.sessionGamesPlayed = 0;
        this.sessionWins = 0;
        this.sessionStartBalance = GAME_CONFIG.STARTING_BALANCE;
    }

    load() {
        try {
            const saved = localStorage.getItem(GAME_CONFIG.STORAGE_KEY);
            if (saved) {
                Object.assign(this, JSON.parse(saved));
                // Initialize session tracking if not present
                if (this.sessionGamesPlayed === undefined) {
                    this.sessionGamesPlayed = 0;
                    this.sessionWins = 0;
                    this.sessionStartBalance = this.balance;
                }
            }
        } catch (error) {
            console.warn('Failed to load game state:', error);
        }
    }

    save() {
        try {
            localStorage.setItem(GAME_CONFIG.STORAGE_KEY, JSON.stringify(this));
        } catch (error) {
            console.warn('Failed to save game state:', error);
        }
    }

    startNewSession() {
        this.balance = GAME_CONFIG.STARTING_BALANCE;
        this.sessionGamesPlayed = 0;
        this.sessionWins = 0;
        this.sessionStartBalance = GAME_CONFIG.STARTING_BALANCE;
        this.winStreak = 0;
        this.lastWin = 0;
    }
}

// Utility Functions
const Utils = {
    $: (id) => document.getElementById(id),
    
    addCommas: (num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','),
    
    generateUniqueNumbers: (count, max, exclude = []) => {
        const numbers = new Set();
        while (numbers.size < count) {
            const num = Math.floor(Math.random() * max) + 1;
            if (!exclude.includes(num)) {
                numbers.add(num);
            }
        }
        return Array.from(numbers).sort((a, b) => a - b);
    },
    
    createPopup: (className, content) => {
        const popup = document.createElement('div');
        popup.className = className;
        popup.innerHTML = content;
        document.body.appendChild(popup);
        return popup;
    },
    
    removePopup: (selector) => {
        const popup = document.querySelector(selector);
        if (popup) popup.remove();
    }
};

// Game Instance
let game = new GameState();

// Game Logic
const GameLogic = {
    quickPick: () => {
        const numbers = Utils.generateUniqueNumbers(
            GAME_CONFIG.NUMBERS_TO_PICK, 
            GAME_CONFIG.NUMBER_RANGE.max
        );
        
        numbers.forEach((num, i) => {
            const input = Utils.$(`pBall${i + 1}`);
            input.value = num;
            input.style.borderColor = '#4CAF50';
            input.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
            input.style.color = 'white';
        });
    },

    validateInput: () => {
        const playerNumbers = [];
        const { min, max } = GAME_CONFIG.NUMBER_RANGE;
        
        for (let i = 1; i <= GAME_CONFIG.NUMBERS_TO_PICK; i++) {
            const value = parseInt(Utils.$(`pBall${i}`).value);
            
            if (isNaN(value) || value < min || value > max) {
                alert(`Please enter valid numbers between ${min}-${max} for all positions.`);
                return null;
            }
            
            if (playerNumbers.includes(value)) {
                alert(`Please enter unique numbers. Number ${value} is repeated.`);
                return null;
            }
            
            playerNumbers.push(value);
        }
        
        return playerNumbers;
    },

    getTicketCost: () => {
        let cost = GAME_CONFIG.TICKET_PRICE;
        if (Utils.$('powerPlay').checked) cost += GAME_CONFIG.POWER_PLAY_COST;
        return cost;
    },

    calculatePrize: (matches, bonusMatch) => {
        if (matches < 2) return { prize: 0, multiplier: 1 };
        
        if (matches === 6) {
            return {
                prize: game.jackpot,
                multiplier: bonusMatch ? 2 : 1
            };
        }
        
        return {
            prize: PRIZE_STRUCTURE[matches] || 0,
            multiplier: 1
        };
    }
};

// Main Game Controller
const GameController = {
    play: () => {
        const playerNumbers = GameLogic.validateInput();
        if (!playerNumbers) return;
        
        const ticketCost = GameLogic.getTicketCost();
        if (game.balance < ticketCost) {
            alert(`Insufficient balance! You need $${ticketCost} but only have $${game.balance}.`);
            return;
        }
        
        // Process game
        game.balance -= ticketCost;
        game.gamesPlayed++;
        game.sessionGamesPlayed++;
        
        // Generate winning numbers
        const winningNumbers = Utils.generateUniqueNumbers(
            GAME_CONFIG.NUMBERS_TO_PICK, 
            GAME_CONFIG.NUMBER_RANGE.max
        );
        const bonusNumber = Utils.generateUniqueNumbers(1, GAME_CONFIG.NUMBER_RANGE.max, winningNumbers)[0];
        
        // Calculate results
        const matches = playerNumbers.filter(num => winningNumbers.includes(num)).length;
        const bonusMatch = playerNumbers.includes(bonusNumber);
        const { prize, multiplier } = GameLogic.calculatePrize(matches, bonusMatch);
        const finalPrize = Utils.$('powerPlay').checked ? prize * 2 : prize;
        
        // Update game state
        GameController.updateGameState(finalPrize, matches, ticketCost);
        
        // Display results
        UI.displayWinningNumbers(winningNumbers, bonusNumber);
        
        // Check for bust
        if (game.balance <= 0) {
            UI.showBustScreen();
            return;
        }
        
        UI.displayResults(matches, bonusMatch, finalPrize, multiplier);
        UI.updateDisplay();
        game.save();
    },

    updateGameState: (finalPrize, matches, ticketCost) => {
        if (finalPrize > 0) {
            game.balance += finalPrize;
            game.totalWins++;
            game.sessionWins++;
            game.winStreak++;
            game.lastWin = finalPrize;
            if (finalPrize > game.biggestWin) {
                game.biggestWin = finalPrize;
            }
        } else {
            game.winStreak = 0;
            game.lastWin = 0;
        }
        
        // Update jackpot
        if (matches === 6) {
            game.jackpot = GAME_CONFIG.STARTING_JACKPOT;
        } else {
            game.jackpot += Math.floor(ticketCost * GAME_CONFIG.JACKPOT_GROWTH_RATE);
        }
    },

    startNewSession: () => {
        game.startNewSession();
        Utils.removePopup('.bust-screen');
        UI.updateDisplay();
        UI.clearInputs();
        UI.resetResultDisplay();
        game.save();
    },

    resetGame: () => {
        if (confirm('Are you sure you want to reset ALL statistics? This will clear your entire game history.')) {
            game.reset();
            localStorage.removeItem(GAME_CONFIG.STORAGE_KEY);
            UI.updateDisplay();
            UI.clearInputs();
            UI.resetResultDisplay();
        }
    }
};

// UI Controller
const UI = {
    displayWinningNumbers: (numbers, bonus) => {
        Utils.$('result').innerHTML = `
            <h3>🎲 Winning Numbers</h3>
            <div style='margin-top: 20px;'>
                ${numbers.map((num, i) => `<div id='ball${i+1}'>${num}</div>`).join('')}
                <div id='bonusBall'>${bonus}</div>
            </div>
        `;
    },

    displayResults: (matches, bonusMatch, prize, multiplier) => {
        const messages = {
            0: '😔 No matches this time. Better luck next draw!',
            6: bonusMatch ? 
                `🎉 SUPER JACKPOT! ${matches} matches + bonus! You won $${Utils.addCommas(prize)}!` :
                `🎉 JACKPOT! ${matches} matches! You won $${Utils.addCommas(prize)}!`,
            default: `🎊 ${matches} matches! You won $${Utils.addCommas(prize)}!`
        };
        
        let message = messages[matches] || messages.default;
        
        if (Utils.$('powerPlay').checked && prize > 0) {
            message += ' ⚡ Power Play doubled your prize!';
        }
        
        setTimeout(() => {
            Utils.createPopup('result-popup', `
                <div class="popup-content">
                    <h3>${message}</h3>
                    <p>Balance: $${Utils.addCommas(game.balance)}</p>
                    <button onclick="this.parentElement.parentElement.remove()">Continue</button>
                </div>
            `);
        }, 1000);
    },

    showBustScreen: () => {
        const sessionProfit = game.balance - game.sessionStartBalance;
        Utils.createPopup('bust-screen', `
            <div class="bust-content">
                <h2>💸 You're Bust!</h2>
                <p>You've run out of money to play.</p>
                <div class="session-summary">
                    <h3>📊 Session Summary</h3>
                    <p>Games Played: ${game.sessionGamesPlayed}</p>
                    <p>Wins: ${game.sessionWins}</p>
                    <p>Session Profit/Loss: <span style="color: ${sessionProfit >= 0 ? '#4CAF50' : '#f44336'}">$${Utils.addCommas(sessionProfit)}</span></p>
                </div>
                <div class="bust-buttons">
                    <button onclick="GameController.startNewSession()" class="new-session-btn">🎆 Start New Session ($100)</button>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" class="close-btn">Close</button>
                </div>
            </div>
        `);
    },

    updateDisplay: () => {
        const elements = {
            balance: `$${Utils.addCommas(game.balance)}`,
            jackpot: `$${Utils.addCommas(game.jackpot)}`,
            lastWin: `$${Utils.addCommas(game.lastWin)}`,
            match: '0',
            streak: game.winStreak,
            gamesPlayed: `${game.gamesPlayed} (${game.sessionGamesPlayed})`,
            totalWins: `${game.totalWins} (${game.sessionWins})`,
            biggestWin: `$${Utils.addCommas(game.biggestWin)}`
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = Utils.$(id);
            if (element) element.textContent = value;
        });
        
        // Win rates
        const overallWinRate = game.gamesPlayed > 0 ? 
            Math.round((game.totalWins / game.gamesPlayed) * 100) : 0;
        const sessionWinRate = game.sessionGamesPlayed > 0 ? 
            Math.round((game.sessionWins / game.sessionGamesPlayed) * 100) : 0;
        Utils.$('winRate').textContent = `${overallWinRate}% (${sessionWinRate}%)`;
        
        // Update play button
        const ticketCost = GameLogic.getTicketCost();
        const playBtn = Utils.$('playBtn');
        playBtn.innerHTML = `<span class="btn-icon">🎲</span>Play ($${ticketCost})`;
        playBtn.disabled = game.balance < ticketCost;
        
        // Balance color coding
        const balanceEl = Utils.$('balance');
        balanceEl.style.color = game.balance <= 0 ? '#f44336' : 
                              game.balance < 20 ? '#ff9800' : '#4CAF50';
    },

    clearInputs: () => {
        for (let i = 1; i <= GAME_CONFIG.NUMBERS_TO_PICK; i++) {
            const input = Utils.$(`pBall${i}`);
            input.value = '';
            input.style.borderColor = '#ddd';
            input.style.background = 'white';
            input.style.color = 'black';
        }
        Utils.$('powerPlay').checked = false;
    },

    resetResultDisplay: () => {
        Utils.$('result').innerHTML = `
            <h3>🎲 Winning Numbers</h3>
            <p class="instruction">Click "Play" to see the winning numbers!</p>
        `;
    }
};

// Global Functions (for HTML onclick handlers)
function startGame() { GameController.play(); }
function quickPick() { GameLogic.quickPick(); }
function resetGame() { GameController.resetGame(); }

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    UI.updateDisplay();
    Utils.$('powerPlay').addEventListener('change', UI.updateDisplay);
});