// game.js
import FarmScene from './src/scenes/FarmScene.js';
import { TILE_SIZE } from './src/core/Constants.js';

const config = {
    type: Phaser.AUTO, // WebGL bevorzugt, Fallback auf Canvas
    width: 800, // Fensterbreite
    height: 600, // Fensterhöhe
    backgroundColor: '#2c3e50',
    parent: 'game-container',
    
    // WICHTIG für Retro-Look (verhindert unscharfe Pixel beim Skalieren)
    pixelArt: true, 
    
    // Physik Engine Hinzufügen
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }, // Top-Down Spiel, keine Schwerkraft
            debug: false       // Setze auf true, um Hitboxen zu sehen
        }
    },

    scene: [FarmScene],
    scale: {
        mode: Phaser.Scale.FIT, // Passt sich dem iPad Screen an
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

const game = new Phaser.Game(config);