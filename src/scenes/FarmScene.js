// src/scenes/FarmScene.js
import { TILE_SIZE, GRID_WIDTH, GRID_HEIGHT, SOIL, OBJECTS } from '../core/Constants.js';
import GridManager from '../data/GridManager.js';
import Player from '../entities/Player.js';

export default class FarmScene extends Phaser.Scene {
    constructor() {
        super('FarmScene');
        this.gridManager = null;
        this.map = null;
        this.layerSoil = null;
        this.player = null;
        this.selector = null;
        this.cursors = null;
    }

    preload() {
        // Tileset laden
        this.load.image('tiles_farm', './assets/tiles_farm.png');
        
        // --- WICHTIGE ÄNDERUNG ---
        // Wir laden das Sprite Sheet basierend auf dem Bild, das Sie hochgeladen haben.
        // Annahme: Das Bild ist quadratisch aufgebaut (z.B. 192x128 Pixel -> 32x32 Frames).
        // Wenn der Charakter im Spiel "verrutscht" aussieht, ändern Sie frameWidth/frameHeight.
        this.load.spritesheet('char_jack', './assets/sprites/char_jack.png', { 
            frameWidth: 32, 
            frameHeight: 32 
        });

        this.load.image('ui_selector', './assets/ui/ui_selector.png');
    }

    create() {
        // 1. Grid Initialisierung
        this.gridManager = new GridManager();

        // 2. Asset Handling / Fallback
        if (!this.textures.exists('tiles_farm')) this.createPlaceholderTiles();
        if (!this.textures.exists('ui_selector')) this.createPlaceholderSelector();

        // 3. Tilemap
        this.map = this.make.tilemap({ tileWidth: TILE_SIZE, tileHeight: TILE_SIZE, width: GRID_WIDTH, height: GRID_HEIGHT });
        const tileset = this.map.addTilesetImage('tiles_farm', 'tiles_farm', TILE_SIZE, TILE_SIZE);
        this.layerSoil = this.map.createBlankLayer('SoilLayer', tileset);
        this.redrawGrid();

        // 4. Player Setup
        const spawnX = (GRID_WIDTH * TILE_SIZE) / 2;
        const spawnY = (GRID_HEIGHT * TILE_SIZE) / 2;
        this.player = new Player(this, spawnX, spawnY);

        // 5. Kamera
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setBounds(0, 0, GRID_WIDTH * TILE_SIZE, GRID_HEIGHT * TILE_SIZE);
        this.cameras.main.setZoom(2.5);

        // 6. Selector
        this.selector = this.add.image(0, 0, 'ui_selector').setOrigin(0, 0);
        this.selector.setAlpha(0.8);

        // 7. Input
        this.cursors = this.input.keyboard.createCursorKeys();

        // Debug Info
        this.add.text(10, 10, 'HARVEST MOON: Player Active', { font: '10px monospace', fill: '#fff', backgroundColor: '#000' }).setScrollFactor(0);
    }

    update(time, delta) {
        if (this.player) {
            this.player.update(this.cursors);
            
            // Selector Snap Logic
            const pX = this.player.x; 
            const pY = this.player.y + (this.player.body.height / 2);
            
            const gridX = Math.floor(pX / TILE_SIZE);
            const gridY = Math.floor(pY / TILE_SIZE);
            
            this.selector.x = gridX * TILE_SIZE;
            this.selector.y = gridY * TILE_SIZE;
        }
    }

    redrawGrid() {
        for (let y = 0; y < GRID_HEIGHT; y++) {
            for (let x = 0; x < GRID_WIDTH; x++) {
                const soilState = this.gridManager.getSoilState(x, y);
                let tileIndex = (soilState === SOIL.WATERED) ? 2 : (soilState === SOIL.HOED) ? 1 : 0;
                this.layerSoil.putTileAt(tileIndex, x, y);
            }
        }
    }

    createPlaceholderTiles() {
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(0x4caf50); graphics.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
        graphics.fillStyle(0x795548); graphics.fillRect(TILE_SIZE, 0, TILE_SIZE, TILE_SIZE);
        graphics.fillStyle(0x3e2723); graphics.fillRect(TILE_SIZE * 2, 0, TILE_SIZE, TILE_SIZE);
        graphics.generateTexture('tiles_farm', TILE_SIZE * 3, TILE_SIZE);
    }

    createPlaceholderSelector() {
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        graphics.lineStyle(2, 0xff0000, 0.8); graphics.strokeRect(0, 0, TILE_SIZE, TILE_SIZE);
        graphics.fillStyle(0xff0000, 0.2); graphics.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
        graphics.generateTexture('ui_selector', TILE_SIZE, TILE_SIZE);
    }
}