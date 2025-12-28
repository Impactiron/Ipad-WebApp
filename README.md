project_memory.md

# Projekt Status: HARVEST MOON REMASTERED (iPad Edition)

## Dateibaum
- index.html
- game.js
- src/core/Constants.js
- src/data/GridManager.js
- src/scenes/FarmScene.js
- src/entities/Player.js  <-- NEU

## Globale Variablen & State
- Grid Größe: 60x57 Tiles
- Tile Größe: 16px
- Speicher: Uint16Array (Bitmasking aktiv)
- Player: Arcade Physics Sprite, 16x24px, State Machine (Idle/Walk)

## Letzte Änderung
- Implementierung Arcade Physics in game.js
- Erstellung der Player Klasse (Bewegung, Animation, Target-Berechnung)
- Integration von Player und Kamera in FarmScene
- Asset Loading für char_jack.png angepasst

## Nächster Schritt
- Implementierung der Interaktion (Pflügen, Gießen) basierend auf `player.getTargetPosition()`
- Implementierung "Smart Touch" UI Overlay (D-Pad Rendering)

## Aktueller Code-Hash
- src/core/Constants.js
- src/data/GridManager.js
- src/scenes/FarmScene.js
- src/entities/Player.js
- game.js
- index.html
