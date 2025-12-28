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
}// src/scenes/FarmScene.js
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
        // Annahme: Das Sprite Sheet ist ein Grid. Wir definieren Frame-Größe.
        // Wenn das Asset größer ist, greift die Logic in Player.js
        this.load.spritesheet('char_jack', './assets/sprites/char_jack.png', {
            frameWidth: 32, // Annahme: Das Quell-Asset ist hochauflösender (z.B. 32px)
            frameHeight: 32
        });
    }

    create() {
        // --- 1. System Init ---
        this.gridManager = new GridManager();

        // Fallback für fehlende Assets erstellen
        if (!this.textures.exists('tiles_farm')) this.createPlaceholderTiles();
        if (!this.textures.exists('char_jack')) this.createPlaceholderPlayer();

        // --- 2. Map Erstellung ---
        this.map = this.make.tilemap({ 
            tileWidth: TILE_SIZE, 
            tileHeight: TILE_SIZE, 
            width: GRID_WIDTH, 
            height: GRID_HEIGHT 
        });

        const tileset = this.map.addTilesetImage('tiles_farm', 'tiles_farm', TILE_SIZE, TILE_SIZE);
        this.layerSoil = this.map.createBlankLayer('SoilLayer', tileset);

        // Grid rendern
        this.redrawGrid();

        // --- 3. Animationen definieren ---
        this.createPlayerAnimations();

        // --- 4. Player Init ---
        // Startposition in der Mitte der Farm
        const startX = (GRID_WIDTH * TILE_SIZE) / 2;
        const startY = (GRID_HEIGHT * TILE_SIZE) / 2;
        
        this.player = new Player(this, startX, startY);

        // --- 5. Kamera Setup ---
        this.cameras.main.setBounds(0, 0, GRID_WIDTH * TILE_SIZE, GRID_HEIGHT * TILE_SIZE);
        this.cameras.main.setZoom(2); // Retro Zoom
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1); // Weiches Verfolgen

        // UI Info Update
        this.add.text(10, 10, 'HARVEST MOON ENGINE v1.1\nSteuerung: Pfeiltasten', {
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
        // Wir nehmen an, das Sprite Sheet hat Standard-Layout (z.B. 4 Reihen)
        // Row 0: Down, Row 1: Left, Row 2: Right, Row 3: Up (Beispielhaft)
        // Falls das Asset anders ist, müssen die 'frames' Nummern angepasst werden.
        
        const frameRate = 8;

        this.anims.create({
            key: 'walk-down',
            frames: this.anims.generateFrameNumbers('char_jack', { start: 0, end: 3 }),
            frameRate: frameRate,
            repeat: -1
        });
        this.anims.create({
            key: 'walk-left',
            frames: this.anims.generateFrameNumbers('char_jack', { start: 4, end: 7 }),
            frameRate: frameRate,
            repeat: -1
        });
        this.anims.create({
            key: 'walk-right',
            frames: this.anims.generateFrameNumbers('char_jack', { start: 8, end: 11 }),
            frameRate: frameRate,
            repeat: -1
        });
        this.anims.create({
            key: 'walk-up',
            frames: this.anims.generateFrameNumbers('char_jack', { start: 12, end: 15 }),
            frameRate: frameRate,
            repeat: -1
        });

        // Idles (einfach der erste Frame der Animation)
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
        graphics.fillStyle(0x3498db); // Blau
        graphics.fillRect(0, 0, 32, 32); // 32px Dummy
        graphics.generateTexture('char_jack', 32*4, 32*4); // Genug Platz für Spritesheet-Logik
    }
}