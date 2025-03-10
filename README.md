# Bacteria Evolution Game

An interactive browser-based game where you control evolving bacteria in a microscopic world.

## Features

- **Multiple Bacteria Types**:
  - **Cocci (Round)**: Balanced speed and size
  - **Bacilli (Rod-shaped)**: Faster but more visible to enemies
  - **Spirilla (Spiral)**: Better at evading enemies

- **Colony Formation**:
  - Bacteria automatically form colonies when close together
  - Colonies provide protection against immune cells
  - Resources are shared between colony members

- **Diverse Immune System**:
  - **Neutrophils**: Fast, aggressive, but short-lived
  - **Macrophages**: Can target multiple bacteria at once
  - **Antibodies**: Tag bacteria to make them more visible to other immune cells

- **Nutrient Types**:
  - **Carbohydrates**: Quick energy but small growth
  - **Proteins**: Better growth but slower energy
  - **Lipids**: Best growth but requires special enzymes

## How to Play

1. Open `index.html` in a modern web browser
2. Choose your bacteria type at the start screen
3. Use WASD or arrow keys to move your bacteria
4. Consume nutrients (green, orange, and yellow dots) to grow
5. Avoid immune cells unless you're big enough to consume them
6. Form colonies with other bacteria for protection
7. Press Space to restart when game over

## Troubleshooting

If you encounter issues with the main game:

1. Check your browser's console for error messages
2. Try opening `game-starter.html` which provides a simplified fallback version
3. Make sure you're using a modern browser with JavaScript ES6 module support
4. If the game doesn't start automatically, look for a "Start Game" button

## Development

The game is built with vanilla JavaScript using a modular architecture:

- `src/constants/`: Game settings and configuration
- `src/entities/`: Game object classes (bacteria, nutrients, immune cells)
- `src/systems/`: Game management and logic
- `index.html`: Main game launcher

## Future Improvements

- Bacterial adaptation and mutation
- More diverse environments with pH and temperature zones
- Tech tree for bacteria evolution
- Multiplayer competitive mode 