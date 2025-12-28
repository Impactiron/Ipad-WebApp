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
        this.cursors = null;
    }

    preload() {
        // Assets laden
        this.load.image('tiles_farm', './assets/tilesets/tiles_farm.png');
        
        // Spieler laden: 16px breit, 24px hoch (Jack ist etwas größer als ein Tile)
        this.load.spritesheet('char_jack', './assets/sprites/char_jack.png', { 
            frameWidth: 16, 
            frameHeight: 24 
        });
    }

    create() {
        // 1. Grid Initialisierung
        this.gridManager = new GridManager();

        // 2. Asset Handling / Fallback Generation
        if (!this.textures.exists('tiles_farm')) {
            this.createPlaceholderTiles();
        }
        
        // Fallback für Player, falls Asset fehlt (Debug Rechteck)
        if (!this.textures.exists('char_jack')) {
             console.warn('Jack Sprite fehlt. Erstelle Platzhalter.');
             this.createPlaceholderPlayer();
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

        // 5. Weltgrenzen für Physik setzen
        this.physics.world.setBounds(0, 0, GRID_WIDTH * TILE_SIZE, GRID_HEIGHT * TILE_SIZE);

        // 6. Spieler erstellen
        // Startposition: Mitte der Farm (ungefähr)
        const startX = (GRID_WIDTH * TILE_SIZE) / 2;
        const startY = (GRID_HEIGHT * TILE_SIZE) / 2;
        this.player = new Player(this, startX, startY);

        // 7. Kamera Setup
        this.cameras.main.setBounds(0, 0, GRID_WIDTH * TILE_SIZE, GRID_HEIGHT * TILE_SIZE);
        this.cameras.main.setZoom(3); // Zoom 3x für knackigen Pixel-Look auf iPad
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1); // Weiches Folgen

        // 8. Steuerung
        this.cursors = this.input.keyboard.createCursorKeys();

        // UI Debug Info
        this.add.text(10, 10, 'HARVEST MOON ENGINE v1.1\nPfeiltasten: Bewegen', {
            font: '10px monospace',
            fill: '#ffffff',
            backgroundColor: '#000000'
        }).setScrollFactor(0).setDepth(100);
    }

    update(time, delta) {
        // Player Update Loop aufrufen
        if (this.player) {
            this.player.update(this.cursors);
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

    createPlaceholderTiles() {
        console.warn('Generiere Tile-Platzhalter...');
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(0x4caf50); graphics.fillRect(0, 0, TILE_SIZE, TILE_SIZE); // Gras
        graphics.fillStyle(0x795548); graphics.fillRect(TILE_SIZE, 0, TILE_SIZE, TILE_SIZE); // Erde
        graphics.fillStyle(0x3e2723); graphics.fillRect(TILE_SIZE * 2, 0, TILE_SIZE, TILE_SIZE); // Nass
        graphics.generateTexture('tiles_farm', TILE_SIZE * 3, TILE_SIZE);
    }

    createPlaceholderPlayer() {
        // Erstellt ein einfaches blaues Rechteck als SpriteSheet Ersatz
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(0x2196F3); // Blau wie Jacks Overall
        graphics.fillRect(0, 0, 16, 24);
        graphics.generateTexture('char_jack', 16, 24); // Single Frame Texture
    }
}