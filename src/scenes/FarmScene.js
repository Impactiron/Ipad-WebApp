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
        // Wir versuchen, echte Assets zu laden.
        this.load.image('tiles_farm', './assets/tiles_farm.png');
        
        // Sprite Sheet laden für den Charakter
        // ACHTUNG: Frame-Größe muss exakt zum PNG passen. Standard Jack ist oft 32x32 oder 16x24.
        // Wir gehen hier von einem 32x32 Raster aus.
        this.load.spritesheet('char_jack', './assets/sprites/char_jack.png', { 
            frameWidth: 32, 
            frameHeight: 32 
        });

        // UI Selector laden (oder Fallback nutzen)
        this.load.image('ui_selector', './assets/ui/ui_selector.png');
    }

    create() {
        // 1. Grid Initialisierung
        this.gridManager = new GridManager();

        // 2. Asset Handling / Fallback Generation
        if (!this.textures.exists('tiles_farm')) {
            this.createPlaceholderTiles();
        }
        if (!this.textures.exists('ui_selector')) {
            this.createPlaceholderSelector();
        }

        // 3. Tilemap Erstellung
        this.map = this.make.tilemap({ 
            tileWidth: TILE_SIZE, 
            tileHeight: TILE_SIZE, 
            width: GRID_WIDTH, 
            height: GRID_HEIGHT 
        });

        const tileset = this.map.addTilesetImage('tiles_farm', 'tiles_farm', TILE_SIZE, TILE_SIZE);
        this.layerSoil = this.map.createBlankLayer('SoilLayer', tileset);

        // 4. Initiales Rendern
        this.redrawGrid();

        // 5. Player Setup
        // Spawn in der Mitte der Farm
        const spawnX = (GRID_WIDTH * TILE_SIZE) / 2;
        const spawnY = (GRID_HEIGHT * TILE_SIZE) / 2;
        
        this.player = new Player(this, spawnX, spawnY);

        // 6. Kamera Setup
        // Kamera folgt dem Spieler
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setBounds(0, 0, GRID_WIDTH * TILE_SIZE, GRID_HEIGHT * TILE_SIZE);
        this.cameras.main.setZoom(2.5); // Zoom für besseren Mobile-Look

        // 7. Selector (Das Ziel-Quadrat)
        this.selector = this.add.image(0, 0, 'ui_selector').setOrigin(0, 0);
        this.selector.setAlpha(0.8); // Leicht transparent

        // 8. Steuerung
        this.cursors = this.input.keyboard.createCursorKeys();

        // UI Info
        this.add.text(10, 10, 'HARVEST MOON ENGINE v1.1\nWASD/Pfeile: Laufen', {
            font: '10px monospace',
            fill: '#ffffff',
            backgroundColor: '#000000'
        }).setScrollFactor(0);
    }

    update(time, delta) {
        // Player Update Loop
        if (this.player) {
            this.player.update(this.cursors);
            
            // Selector Position berechnen (Snap to Grid)
            // Wir nehmen die Mitte des Spielers für genaueres Zielen
            // +8 Pixel Offset (halbe Tile Size), da Origin oft Center ist, aber Grid TopLeft
            const pX = this.player.x; 
            const pY = this.player.y + (this.player.body.height / 2); // Füße anvisieren
            
            // Umrechnung in Grid-Koordinaten
            const gridX = Math.floor(pX / TILE_SIZE);
            const gridY = Math.floor(pY / TILE_SIZE);
            
            // Selector dort positionieren
            this.selector.x = gridX * TILE_SIZE;
            this.selector.y = gridY * TILE_SIZE;
        }
    }

    /**
     * Synchronisiert das visuelle Tilemap mit den Daten im GridManager.
     */
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

    createPlaceholderTiles() {
        console.warn('Asset "tiles_farm.png" nicht gefunden. Generiere Platzhalter...');
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(0x4caf50); graphics.fillRect(0, 0, TILE_SIZE, TILE_SIZE); // Gras
        graphics.fillStyle(0x795548); graphics.fillRect(TILE_SIZE, 0, TILE_SIZE, TILE_SIZE); // Erde
        graphics.fillStyle(0x3e2723); graphics.fillRect(TILE_SIZE * 2, 0, TILE_SIZE, TILE_SIZE); // Nass
        graphics.generateTexture('tiles_farm', TILE_SIZE * 3, TILE_SIZE);
    }

    createPlaceholderSelector() {
        console.warn('Asset "ui_selector.png" nicht gefunden. Generiere Platzhalter...');
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        
        // Roter Rahmen
        graphics.lineStyle(2, 0xff0000, 0.8);
        graphics.strokeRect(0, 0, TILE_SIZE, TILE_SIZE);
        
        // Leicht rote Füllung
        graphics.fillStyle(0xff0000, 0.2);
        graphics.fillRect(0, 0, TILE_SIZE, TILE_SIZE);

        graphics.generateTexture('ui_selector', TILE_SIZE, TILE_SIZE);
    }
}