# EmpireClick - 3D Kingdom Game

A browser-based idle/clicker game where players claim plots of land, build structures, and earn income.

## Project Structure

The original large HTML file has been broken down into separate, manageable files:

### Files:
- **`index.html`** - Main HTML structure with game layout
- **`styles.css`** - All CSS styles for the game interface
- **`game.js`** - Core game logic and mechanics
- **`ui.js`** - UI helper functions and event handlers

### Features:
- **Plot System**: 500 plots (25x20 grid) that can be claimed and built on
- **Rarity System**: 5 rarity levels (Common, Rare, Epic, Legendary, Elite)
- **Earnings System**: Passive income generation from owned plots
- **Daily Login**: Bonus system with random rewards
- **Achievement System**: Unlock achievements as you progress
- **3D Camera**: Navigate the world with WASD keys
- **Responsive Design**: Works on different screen sizes

### How to Play:
1. Click on unclaimed plots to purchase them
2. Each plot has a random rarity that determines earnings
3. Use WASD keys to navigate the world
4. Complete daily logins for bonus multipliers
5. Explore claimed plots to find additional rewards

### Game Mechanics:
- **Plot Costs**: 100 RevCoins (Common-Rare), 1000 Premium RevCoins (Elite)
- **Earnings**: Based on plot rarity and multipliers
- **Explorations**: Use "Finds" to explore plots for bonus rewards
- **Daily Login**: Watch ads to roll for bonus multipliers

### Development:
The code is now modular and easier to maintain:
- **HTML**: Clean structure with external CSS/JS links
- **CSS**: Organized styles with comments
- **JavaScript**: Separated into game logic and UI functions
- **Extensible**: Easy to add new features or modify existing ones

### Running the Game:
Simply open `index.html` in a web browser to start playing! 