# 🎰 Lucky Numbers Lotto

**A modern, interactive lottery game with progressive jackpots, statistics tracking, and engaging gameplay**

---

## 📊 **PROJECT METADATA**

| **Category** | web-games |
|--------------|-----------|
| **Languages** | javascript/html-css |
| **Technologies** | web/gui/responsive |
| **Frameworks** | vanilla-js/css3 |
| **Status** | production |
| **Year** | 2025 |
| **Featured** | true |
| **HasDownload** | true |
| **DownloadUrl** | webpage |

---

## ✨ **KEY FEATURES**

### 🎲 **Core Gameplay**
- **6-number lottery** - Pick numbers from 1-35
- **Bonus ball system** - Extra multiplier for jackpot wins
- **Power Play option** - Double your winnings for +$2
- **Progressive jackpot** - Grows with each game played

### 📊 **Advanced Statistics**
- **Session tracking** - Compare current session to overall performance
- **Win rate calculation** - Track your success percentage
- **Biggest win tracking** - Remember your best moment
- **Persistent storage** - Never lose your progress

### 🎮 **User Experience**
- **Quick Pick** - Auto-generate random numbers
- **Bust protection** - Start new sessions when funds run out
- **Real-time feedback** - Animated results and popups
- **Responsive design** - Works on desktop, tablet, and mobile

### 💰 **Balanced Economics**
- **$5 ticket price** - Affordable gameplay
- **27% win rate** - Realistic win rates for each prize catagory
- **Realistic prize structure** - From $5 break-even to massive jackpots
- **Smart bankroll management** - $100 starting balance

---

## 🖥️ **TECHNICAL REQUIREMENTS**

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **Browser** | Chrome 60+, Firefox 55+ | Latest Chrome/Firefox |
| **JavaScript** | ES6 support required | ES2020+ |
| **Storage** | 1MB local storage | 5MB+ available |
| **Screen** | 320px width minimum | 1024px+ width |
| **Internet** | Not required (offline game) | N/A |

---

## 📋 **INSTALLATION & SETUP**

### **Step 1: Clone Repository**
```bash
git clone https://github.com/NathanLCleary/lotto.git
cd lotto
```

### **Step 2: Open in Browser**
```bash
# Simply open index.html in your browser
# No build process or dependencies required
open index.html
```

### **Step 3: Start Playing**
1. **Choose your numbers** (1-35) or use Quick Pick
2. **Optional**: Enable Power Play for 2x multiplier
3. **Click Play** and watch the winning numbers appear
4. **Track your progress** in the statistics panel

---

## 🎯 **USAGE GUIDE**

### **Basic Gameplay**
1. **Select Numbers**: Choose 6 unique numbers between 1-35
2. **Power Play**: Check the box to double non-jackpot prizes (+$2)
3. **Play**: Click the Play button to draw winning numbers
4. **Win Conditions**: Match 2+ numbers to win prizes

### **Prize Structure**
- **2 matches**: $5 (break even)
- **3 matches**: $25 (5x return)
- **4 matches**: $100 (20x return)
- **5 matches**: $1,000 (200x return)
- **6 matches**: JACKPOT! (starts at $10,000)
- **6 + Bonus**: JACKPOT x2!

### **Advanced Features**
- **Quick Pick**: Auto-generate 6 random numbers
- **Statistics**: Track total vs current session performance
- **New Session**: Start fresh when you go bust (preserves overall stats)
- **Reset Game**: Clear all statistics and start completely over

---

## 📁 **PROJECT STRUCTURE**

```
lotto/
├── index.html           # Main game interface
├── css/
│   └── main.css        # Responsive styling and animations
├── js/
│   └── main.js         # Game logic and state management
└── README.md           # This file
```

---

## 🛠️ **TECHNOLOGIES USED**

### **Frontend Technologies**
- **HTML5**: Semantic structure and form validation
- **CSS3**: Modern styling with gradients, animations, and flexbox
- **Vanilla JavaScript**: ES6+ with modular architecture

### **Key Features**
- **LocalStorage API**: Persistent game state and statistics
- **CSS Grid & Flexbox**: Responsive three-column layout
- **CSS Animations**: Smooth transitions and visual feedback
- **Modern JavaScript**: Classes, modules, and arrow functions

### **Architecture Patterns**
- **MVC Pattern**: Separated game logic, UI, and state management
- **Module Pattern**: Organized code into logical namespaces
- **Observer Pattern**: Event-driven UI updates

---

## 👨💻 **DEVELOPMENT**

### **Code Structure**
- **GameState Class**: Manages all game data and persistence
- **GameLogic Module**: Pure functions for game calculations
- **GameController**: Orchestrates game flow and state updates
- **UI Module**: Handles all DOM manipulation and display

### **Configuration**
Game settings can be easily modified in `GAME_CONFIG`:
```javascript
const GAME_CONFIG = {
    STARTING_BALANCE: 100,
    TICKET_PRICE: 5,
    NUMBER_RANGE: { min: 1, max: 35 },
    NUMBERS_TO_PICK: 6
};
```

### **Adding New Features**
1. **New Prize Tiers**: Modify `PRIZE_STRUCTURE` object
2. **Different Number Ranges**: Update `GAME_CONFIG.NUMBER_RANGE`
3. **New Statistics**: Add to `GameState` class and `UI.updateDisplay()`

---

## 🎲 **GAME MATHEMATICS**

### **Winning Odds (6 from 1-35)**
- **2 matches**: 1 in 4.4 (22.7% chance)
- **3 matches**: 1 in 24 (4.2% chance)
- **4 matches**: 1 in 214 (0.47% chance)
- **5 matches**: 1 in 3,365 (0.03% chance)
- **6 matches**: 1 in 324,632 (jackpot)

### **Expected Value**
- **Overall win rate**: ~27% 
- **House edge**: ~40%
- **Average session length**: 20-30 games before bust

---

## 📄 **LICENSE & CONTACT**

### **License**
This project is part of Nathan Cleary's portfolio. Free for educational and personal use.

### **Contact**
- **GitHub**: [NathanLCleary](https://github.com/NathanLCleary)
- **LinkedIn**: [nathanlcleary](https://www.linkedin.com/in/nathanlcleary/)
- **Email**: nathanlcleary@gmail.com

---

*Part of Nathan Cleary's software development portfolio - showcasing modern web development, game design, and user experience principles*