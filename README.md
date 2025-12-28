project_memory.md

# Projekt Status: HARVEST MOON REMASTERED (iPad Edition)

## Dateibaum
- index.html
- game.js (Updated: Physics active)
- src/core/Constants.js
- src/data/GridManager.js
- src/entities/Player.js (New: Movement & Auto-Scaling)
- src/scenes/FarmScene.js (Updated: Player integration)

## Globale Variablen & State
- Grid Größe: 60x57 Tiles
- Tile Größe: 16px
- Player Speed: 80 px/s
- Zoom: 2x

## Letzte Änderung
- Implementierung der Arcade Physics in game.js.
- Erstellung der Player-Entity mit automatischer Skalierung für Assets > 16px.
- Einbau der Kamera-Verfolgung und Kollision in FarmScene.

## Nächster Schritt
- Implementierung der Interaktion (A-Button für Werkzeugnutzung).
- Implementierung "Smart Touch" UI Overlay (D-Pad).

## Aktueller Code-Hash
- src/entities/Player.js
- src/scenes/FarmScene.js
- game.js
