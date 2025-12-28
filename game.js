// game.js
import FarmScene from './src/scenes/FarmScene.js';
import { TILE_SIZE } from './src/core/Constants.js';

const config = {
    type: Phaser.AUTO, // WebGL bevorzugt, Fallback auf Canvas
    width: 800, // Fensterbreite
    height: 600, // Fensterhöhe
    backgroundColor: '#2c3e50',
    parent: 'game-container',
    pixelArt: true, // WICHTIG für Retro-Look (verhindert unscharfe Pixel beim Skalieren)
    scene: [FarmScene],
    scale: {
        mode: Phaser.Scale.FIT, // Passt sich dem iPad Screen an
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

const game = new Phaser.Game(config);