// Game Constants
const GAME_CONFIG = {
    STARTING_BALANCE: 100,
    STARTING_JACKPOT: 10000,
    TICKET_PRICE: 5,
    POWER_PLAY_COST: 2,
    NUMBER_RANGE: { min: 1, max: 35 },
    NUMBERS_TO_PICK: 6,
    JACKPOT_GROWTH_RATE: 0.3,
    STORAGE_NAME: 'lottoGameState'
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
            const saved = localStorage.getItem(GAME_CONFIG.STORAGE_NAME);
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
            localStorage.setItem(GAME_CONFIG.STORAGE_NAME, JSON.stringify(this));
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
    $: (id) => {
        try {
            return document.getElementById(id);
        } catch (error) {
            console.warn('Element not found:', id);
            return null;
        }
    },
    
    addCommas: (num) => {
        try {
            const safeNum = Math.max(0, parseInt(num) || 0);
            return safeNum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        } catch (error) {
            return '0';
        }
    },
    
    generateUniqueNumbers: (count, max, exclude = []) => {
        try {
            const safeCount = Math.max(1, Math.min(10, parseInt(count) || 1));
            const safeMax = Math.max(1, Math.min(100, parseInt(max) || 35));
            const numbers = new Set();
            let attempts = 0;
            
            while (numbers.size < safeCount && attempts < 1000) {
                const num = Math.floor(Math.random() * safeMax) + 1;
                if (!exclude.includes(num)) {
                    numbers.add(num);
                }
                attempts++;
            }
            
            return Array.from(numbers).sort((a, b) => a - b);
        } catch (error) {
            console.warn('Error generating numbers:', error);
            return [1, 2, 3, 4, 5, 6].slice(0, count);
        }
    },
    
    removePopup: (selector) => {
        try {
            const popup = document.querySelector(selector);
            if (popup) popup.remove();
        } catch (error) {
            console.warn('Error removing popup:', error);
        }
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
            if (input) {
                input.value = UI.sanitizeNumber(num);
                input.style.borderColor = '#4CAF50';
                input.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
                input.style.color = 'white';
            }
        });
    },

    validateInput: () => {
        const playerNumbers = [];
        const { min, max } = GAME_CONFIG.NUMBER_RANGE;
        
        for (let i = 1; i <= GAME_CONFIG.NUMBERS_TO_PICK; i++) {
            const inputEl = Utils.$(`pBall${i}`);
            if (!inputEl) continue;
            
            const value = parseInt(inputEl.value);
            
            if (isNaN(value) || value < min || value > max) {
                UI.showAlert(`Please enter valid numbers between ${min}-${max} for all positions.`);
                return null;
            }
            
            if (playerNumbers.includes(value)) {
                UI.showAlert(`Please enter unique numbers. Number ${value} is repeated.`);
                return null;
            }
            
            playerNumbers.push(value);
        }
        
        return playerNumbers;
    },

    getTicketCost: () => {
        let cost = GAME_CONFIG.TICKET_PRICE;
        const powerPlayEl = Utils.$('powerPlay');
        if (powerPlayEl && powerPlayEl.checked) cost += GAME_CONFIG.POWER_PLAY_COST;
        return Math.max(0, cost);
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
            UI.showAlert(`Insufficient balance! You need $${ticketCost} but only have $${game.balance}.`);
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
        const powerPlayEl = Utils.$('powerPlay');
        const finalPrize = (powerPlayEl && powerPlayEl.checked) ? prize * 2 : prize;
        
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
        UI.showConfirm(
            'Are you sure you want to reset ALL statistics? This will clear your entire game history.',
            () => {
                game.reset();
                localStorage.removeItem(GAME_CONFIG.STORAGE_NAME);
                UI.updateDisplay();
                UI.clearInputs();
                UI.resetResultDisplay();
            }
        );
    }
};

// UI Controller
const UI = {
    sanitizeNumber: (num) => {
        const sanitized = parseInt(num);
        return isNaN(sanitized) ? 0 : Math.max(0, Math.min(99, sanitized));
    },

    showAlert: (message) => {
        const popup = document.createElement('div');
        popup.className = 'alert-popup';
        
        const content = document.createElement('div');
        content.className = 'alert-content';
        
        const messageEl = document.createElement('p');
        messageEl.textContent = message;
        
        const button = document.createElement('button');
        button.textContent = 'OK';
        button.className = 'alert-btn';
        button.onclick = () => popup.remove();
        
        content.appendChild(messageEl);
        content.appendChild(button);
        popup.appendChild(content);
        document.body.appendChild(popup);
    },

    showConfirm: (message, onConfirm) => {
        const popup = document.createElement('div');
        popup.className = 'confirm-popup';
        
        const content = document.createElement('div');
        content.className = 'confirm-content';
        
        const messageEl = document.createElement('p');
        messageEl.textContent = message;
        
        const buttons = document.createElement('div');
        buttons.className = 'confirm-buttons';
        
        const confirmBtn = document.createElement('button');
        confirmBtn.textContent = 'Yes';
        confirmBtn.className = 'confirm-btn';
        confirmBtn.onclick = () => {
            popup.remove();
            if (onConfirm) onConfirm();
        };
        
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancel';
        cancelBtn.className = 'cancel-btn';
        cancelBtn.onclick = () => popup.remove();
        
        buttons.appendChild(confirmBtn);
        buttons.appendChild(cancelBtn);
        content.appendChild(messageEl);
        content.appendChild(buttons);
        popup.appendChild(content);
        document.body.appendChild(popup);
    },

    displayWinningNumbers: (numbers, bonus) => {
        const resultEl = Utils.$('result');
        resultEl.innerHTML = '';
        
        const title = document.createElement('h3');
        title.textContent = '🎲 Winning Numbers';
        resultEl.appendChild(title);
        
        const ballsContainer = document.createElement('div');
        ballsContainer.style.marginTop = '20px';
        
        numbers.forEach((num, i) => {
            const ball = document.createElement('div');
            ball.id = `ball${i+1}`;
            ball.textContent = UI.sanitizeNumber(num);
            ballsContainer.appendChild(ball);
        });
        
        const bonusBall = document.createElement('div');
        bonusBall.id = 'bonusBall';
        bonusBall.textContent = UI.sanitizeNumber(bonus);
        ballsContainer.appendChild(bonusBall);
        
        resultEl.appendChild(ballsContainer);
    },

    displayResults: (matches, bonusMatch, prize, multiplier) => {
        const safeMatches = UI.sanitizeNumber(matches);
        const safePrize = Math.max(0, parseInt(prize) || 0);
        
        const messages = {
            0: '😔 No matches this time. Better luck next draw!',
            6: bonusMatch ? 
                `🎉 SUPER JACKPOT! ${safeMatches} matches + bonus! You won $${Utils.addCommas(safePrize)}!` :
                `🎉 JACKPOT! ${safeMatches} matches! You won $${Utils.addCommas(safePrize)}!`,
            default: `🎊 ${safeMatches} matches! You won $${Utils.addCommas(safePrize)}!`
        };
        
        let message = messages[safeMatches] || messages.default;
        
        const powerPlayEl = Utils.$('powerPlay');
        if (powerPlayEl && powerPlayEl.checked && safePrize > 0) {
            message += ' ⚡ Power Play doubled your prize!';
        }
        
        setTimeout(() => {
            const popup = document.createElement('div');
            popup.className = 'result-popup';
            
            const content = document.createElement('div');
            content.className = 'popup-content';
            
            const messageEl = document.createElement('h3');
            messageEl.textContent = message;
            
            const balanceEl = document.createElement('p');
            balanceEl.textContent = `Balance: $${Utils.addCommas(Math.max(0, game.balance))}`;
            
            const button = document.createElement('button');
            button.textContent = 'Continue';
            button.onclick = () => popup.remove();
            
            content.appendChild(messageEl);
            content.appendChild(balanceEl);
            content.appendChild(button);
            popup.appendChild(content);
            document.body.appendChild(popup);
        }, 1000);
    },

    showBustScreen: () => {
        const sessionProfit = game.balance - game.sessionStartBalance;
        const safeProfit = parseInt(sessionProfit) || 0;
        
        const popup = document.createElement('div');
        popup.className = 'bust-screen';
        
        const content = document.createElement('div');
        content.className = 'bust-content';
        
        const title = document.createElement('h2');
        title.textContent = '💸 You\'re Bust!';
        
        const subtitle = document.createElement('p');
        subtitle.textContent = 'You\'ve run out of money to play.';
        
        const summary = document.createElement('div');
        summary.className = 'session-summary';
        
        const summaryTitle = document.createElement('h3');
        summaryTitle.textContent = '📊 Session Summary';
        
        const gamesP = document.createElement('p');
        gamesP.textContent = `Games Played: ${Math.max(0, game.sessionGamesPlayed)}`;
        
        const winsP = document.createElement('p');
        winsP.textContent = `Wins: ${Math.max(0, game.sessionWins)}`;
        
        const profitP = document.createElement('p');
        const profitSpan = document.createElement('span');
        profitSpan.style.color = safeProfit >= 0 ? '#4CAF50' : '#f44336';
        profitSpan.textContent = `$${Utils.addCommas(Math.abs(safeProfit))}`;
        profitP.textContent = 'Session Profit/Loss: ';
        profitP.appendChild(profitSpan); 'Session Profit/Loss: ';
        profitP.appendChild(profitSpan);
        
        const buttons = document.createElement('div');
        buttons.className = 'bust-buttons';
        
        const newSessionBtn = document.createElement('button');
        newSessionBtn.className = 'new-session-btn';
        newSessionBtn.textContent = '🎆 Start New Session ($100)';
        newSessionBtn.onclick = () => GameController.startNewSession();
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-btn';
        closeBtn.textContent = 'Close';
        closeBtn.onclick = () => popup.remove();
        
        summary.appendChild(summaryTitle);
        summary.appendChild(gamesP);
        summary.appendChild(winsP);
        summary.appendChild(profitP);
        
        buttons.appendChild(newSessionBtn);
        buttons.appendChild(closeBtn);
        
        content.appendChild(title);
        content.appendChild(subtitle);
        content.appendChild(summary);
        content.appendChild(buttons);
        popup.appendChild(content);
        document.body.appendChild(popup);
    },

    updateDisplay: () => {
        const safeBalance = Math.max(0, parseInt(game.balance) || 0);
        const safeJackpot = Math.max(0, parseInt(game.jackpot) || 0);
        const safeLastWin = Math.max(0, parseInt(game.lastWin) || 0);
        const safeStreak = Math.max(0, parseInt(game.winStreak) || 0);
        const safeGamesPlayed = Math.max(0, parseInt(game.gamesPlayed) || 0);
        const safeSessionGames = Math.max(0, parseInt(game.sessionGamesPlayed) || 0);
        const safeTotalWins = Math.max(0, parseInt(game.totalWins) || 0);
        const safeSessionWins = Math.max(0, parseInt(game.sessionWins) || 0);
        const safeBiggestWin = Math.max(0, parseInt(game.biggestWin) || 0);
        
        const elements = {
            balance: `$${Utils.addCommas(safeBalance)}`,
            jackpot: `$${Utils.addCommas(safeJackpot)}`,
            lastWin: `$${Utils.addCommas(safeLastWin)}`,
            match: '0',
            streak: safeStreak.toString(),
            gamesPlayed: `${safeGamesPlayed} (${safeSessionGames})`,
            totalWins: `${safeTotalWins} (${safeSessionWins})`,
            biggestWin: `$${Utils.addCommas(safeBiggestWin)}`
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = Utils.$(id);
            if (element) element.textContent = value;
        });
        
        // Win rates
        const overallWinRate = safeGamesPlayed > 0 ? 
            Math.round((safeTotalWins / safeGamesPlayed) * 100) : 0;
        const sessionWinRate = safeSessionGames > 0 ? 
            Math.round((safeSessionWins / safeSessionGames) * 100) : 0;
        const winRateEl = Utils.$('winRate');
        if (winRateEl) winRateEl.textContent = `${Math.max(0, overallWinRate)}% (${Math.max(0, sessionWinRate)}%)`;
        
        // Update play button
        const ticketCost = GameLogic.getTicketCost();
        const playBtn = Utils.$('playBtn');
        if (playBtn) {
            playBtn.textContent = '';
            const icon = document.createElement('span');
            icon.className = 'btn-icon';
            icon.textContent = '🎲';
            playBtn.appendChild(icon);
            playBtn.appendChild(document.createTextNode(`Play ($${Math.max(0, ticketCost)})`));
            playBtn.disabled = safeBalance < ticketCost;
        }
        
        // Balance color coding
        const balanceEl = Utils.$('balance');
        if (balanceEl) {
            balanceEl.style.color = safeBalance <= 0 ? '#f44336' : 
                                  safeBalance < 20 ? '#ff9800' : '#4CAF50';
        }
    },

    clearInputs: () => {
        for (let i = 1; i <= GAME_CONFIG.NUMBERS_TO_PICK; i++) {
            const input = Utils.$(`pBall${i}`);
            if (input) {
                input.value = '';
                input.style.borderColor = '#ddd';
                input.style.background = 'white';
                input.style.color = 'black';
            }
        }
        const powerPlayEl = Utils.$('powerPlay');
        if (powerPlayEl) powerPlayEl.checked = false;
    },

    resetResultDisplay: () => {
        const resultEl = Utils.$('result');
        resultEl.innerHTML = '';
        
        const title = document.createElement('h3');
        title.textContent = '🎲 Winning Numbers';
        
        const instruction = document.createElement('p');
        instruction.className = 'instruction';
        instruction.textContent = 'Click "Play" to see the winning numbers!';
        
        resultEl.appendChild(title);
        resultEl.appendChild(instruction);
    }
};

// Global Functions (for HTML onclick handlers)
function startGame() { GameController.play(); }
function quickPick() { GameLogic.quickPick(); }
function resetGame() { GameController.resetGame(); }

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    try {
        UI.updateDisplay();
        const powerPlayEl = Utils.$('powerPlay');
        if (powerPlayEl) {
            powerPlayEl.addEventListener('change', UI.updateDisplay);
        }
    } catch (error) {
        console.warn('Error initializing application:', error);
    }
});