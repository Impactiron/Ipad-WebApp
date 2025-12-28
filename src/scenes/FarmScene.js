// src/scenes/FarmScene.js
import { TILE_SIZE, GRID_WIDTH, GRID_HEIGHT, SOIL } from '../core/Constants.js';
import GridManager from '../data/GridManager.js';
import Player from '../entities/Player.js';

export default class FarmScene extends Phaser.Scene {
    constructor() {
        super('FarmScene');
        this.gridManager = null;
        this.map = null;
        this.layerSoil = null;
        this.player = null;
    }

    preload() {
        // 1. Map Tiles laden
        this.load.image('tiles_farm', './assets/tilesets/tiles_farm.png');
        
        // 2. Character Sprite Sheet laden
        this.load.spritesheet('char_jack', './assets/sprites/char_jack.png', {
            frameWidth: 32, 
            frameHeight: 32
        });
    }

    create() {
        // --- 1. System Init ---
        this.gridManager = new GridManager();

        // Fallback für fehlende Assets
        if (!this.textures.exists('tiles_farm')) this.createPlaceholderTiles();
        if (!this.textures.exists('char_jack')) this.createPlaceholderPlayer();

        // --- 2. Map Erstellung ---
        this.map = this.make.tilemap({ 
            tileWidth: TILE_SIZE, 
            tileHeight: TILE_SIZE, 
            width: GRID_WIDTH, 
            height: GRID_HEIGHT 
        });

        // Tileset binden
        const tileset = this.map.addTilesetImage('tiles_farm', 'tiles_farm', TILE_SIZE, TILE_SIZE);
        
        // Layer erstellen
        this.layerSoil = this.map.createBlankLayer('SoilLayer', tileset);

        // Grid initial rendern
        this.redrawGrid();

        // --- 3. Animationen ---
        this.createPlayerAnimations();

        // --- 4. Player Init ---
        // Startposition in der Mitte der Farm
        const startX = (GRID_WIDTH * TILE_SIZE) / 2;
        const startY = (GRID_HEIGHT * TILE_SIZE) / 2;
        
        this.player = new Player(this, startX, startY);

        // --- 5. Kamera Setup ---
        this.cameras.main.setBounds(0, 0, GRID_WIDTH * TILE_SIZE, GRID_HEIGHT * TILE_SIZE);
        this.cameras.main.setZoom(2); // Retro Zoom
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        // UI Info
        this.add.text(10, 10, 'HARVEST MOON ENGINE v1.1\nPfeiltasten: Bewegen', {
            font: '10px monospace',
            fill: '#ffffff',
            backgroundColor: '#000000'
        }).setScrollFactor(0).setDepth(100);
    }

    update(time, delta) {
        if (this.player) {
            this.player.update(time, delta);
        }
    }

    redrawGrid() {
        for (let y = 0; y < GRID_HEIGHT; y++) {
            for (let x = 0; x < GRID_WIDTH; x++) {
                const soilState = this.gridManager.getSoilState(x, y);
                let tileIndex = 0; 
                
                if (soilState === SOIL.NORMAL) tileIndex = 0;
                else if (soilState === SOIL.HOED) tileIndex = 1;
                else if (soilState === SOIL.WATERED) tileIndex = 2;

                this.layerSoil.putTileAt(tileIndex, x, y);
            }
        }
    }

    createPlayerAnimations() {
        const frameRate = 8;

        // Walk Animations
        this.anims.create({ key: 'walk-down', frames: this.anims.generateFrameNumbers('char_jack', { start: 0, end: 3 }), frameRate: frameRate, repeat: -1 });
        this.anims.create({ key: 'walk-left', frames: this.anims.generateFrameNumbers('char_jack', { start: 4, end: 7 }), frameRate: frameRate, repeat: -1 });
        this.anims.create({ key: 'walk-right', frames: this.anims.generateFrameNumbers('char_jack', { start: 8, end: 11 }), frameRate: frameRate, repeat: -1 });
        this.anims.create({ key: 'walk-up', frames: this.anims.generateFrameNumbers('char_jack', { start: 12, end: 15 }), frameRate: frameRate, repeat: -1 });

        // Idle Animations
        this.anims.create({ key: 'idle-down', frames: [ { key: 'char_jack', frame: 0 } ], frameRate: 1 });
        this.anims.create({ key: 'idle-left', frames: [ { key: 'char_jack', frame: 4 } ], frameRate: 1 });
        this.anims.create({ key: 'idle-right', frames: [ { key: 'char_jack', frame: 8 } ], frameRate: 1 });
        this.anims.create({ key: 'idle-up', frames: [ { key: 'char_jack', frame: 12 } ], frameRate: 1 });
    }

    createPlaceholderTiles() {
        console.warn('Asset "tiles_farm" nicht gefunden. Generiere Platzhalter...');
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(0x4caf50); graphics.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
        graphics.fillStyle(0x795548); graphics.fillRect(TILE_SIZE, 0, TILE_SIZE, TILE_SIZE);
        graphics.fillStyle(0x3e2723); graphics.fillRect(TILE_SIZE * 2, 0, TILE_SIZE, TILE_SIZE);
        graphics.generateTexture('tiles_farm', TILE_SIZE * 3, TILE_SIZE);
    }

    createPlaceholderPlayer() {
        console.warn('Asset "char_jack" nicht gefunden. Generiere Platzhalter...');
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(0x3498db);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture('char_jack', 32*4, 32*4);
    }
}