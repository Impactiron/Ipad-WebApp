// src/scenes/FarmScene.js
import { TILE_SIZE, GRID_WIDTH, GRID_HEIGHT, SOIL, OBJECTS } from '../core/Constants.js';
import GridManager from '../data/GridManager.js';

export default class FarmScene extends Phaser.Scene {
    constructor() {
        super('FarmScene');
        this.gridManager = null;
        this.map = null;
        this.layerSoil = null;
        this.controls = null;
    }

    preload() {
        // Wir versuchen, echte Assets zu laden. Wenn nicht vorhanden, generieren wir sie.
        this.load.image('tiles_farm', './assets/tiles_farm.png');
    }

    create() {
        // 1. Grid Initialisierung
        this.gridManager = new GridManager();

        // 2. Asset Handling / Fallback Generation
        if (!this.textures.exists('tiles_farm')) {
            this.createPlaceholderTiles();
        }

        // 3. Tilemap Erstellung
        // Erstellt eine leere Tilemap basierend auf Grid-Größe
        this.map = this.make.tilemap({ 
            tileWidth: TILE_SIZE, 
            tileHeight: TILE_SIZE, 
            width: GRID_WIDTH, 
            height: GRID_HEIGHT 
        });

        // Tileset binden (Name im Cache, Name in Tiled - hier egal da Code-gen)
        const tileset = this.map.addTilesetImage('tiles_farm', 'tiles_farm', TILE_SIZE, TILE_SIZE);

        // Layer erstellen
        this.layerSoil = this.map.createBlankLayer('SoilLayer', tileset);

        // 4. Initiales Rendern (Daten aus GridManager in Tilemap übertragen)
        this.redrawGrid();

        // 5. Kamera Setup
        // Kamera auf die Weltgröße begrenzen
        this.cameras.main.setBounds(0, 0, GRID_WIDTH * TILE_SIZE, GRID_HEIGHT * TILE_SIZE);
        // Zoom für Retro-Look
        this.cameras.main.setZoom(2);
        this.cameras.main.centerOn((GRID_WIDTH * TILE_SIZE)/2, (GRID_HEIGHT * TILE_SIZE)/2);

        // 6. Steuerung (Einfache Kamera-Bewegung für Debugging)
        this.cursors = this.input.keyboard.createCursorKeys();

        // UI Info
        this.add.text(10, 10, 'HARVEST MOON ENGINE v1.0\nPfeiltasten: Kamera', {
            font: '10px monospace',
            fill: '#ffffff',
            backgroundColor: '#000000'
        }).setScrollFactor(0);
    }

    update(time, delta) {
        // Einfache Kamera-Steuerung
        const speed = 5;
        if (this.cursors.left.isDown) this.cameras.main.scrollX -= speed;
        if (this.cursors.right.isDown) this.cameras.main.scrollX += speed;
        if (this.cursors.up.isDown) this.cameras.main.scrollY -= speed;
        if (this.cursors.down.isDown) this.cameras.main.scrollY += speed;
    }

    /**
     * Synchronisiert das visuelle Tilemap mit den Daten im GridManager.
     * Dies ist sehr performant, da Tilemaps für solche Operationen gebaut sind.
     */
    redrawGrid() {
        // Wir iterieren durch den sichtbaren Bereich (oder alles, bei der Größe ist alles okay)
        for (let y = 0; y < GRID_HEIGHT; y++) {
            for (let x = 0; x < GRID_WIDTH; x++) {
                const soilState = this.gridManager.getSoilState(x, y);
                
                // Mapping: SoilState -> TileIndex (Basierend auf Placeholder Generierung)
                // 0: Normal (Grün), 1: Gepflügt (Braun), 2: Gegossen (Dunkelbraun)
                let tileIndex = 0; 
                
                if (soilState === SOIL.NORMAL) tileIndex = 0; // Gras
                else if (soilState === SOIL.HOED) tileIndex = 1; // Erde
                else if (soilState === SOIL.WATERED) tileIndex = 2; // Nass

                this.layerSoil.putTileAt(tileIndex, x, y);
            }
        }
    }

    /**
     * Generiert eine 3-Tile Textur, falls keine Datei vorhanden ist.
     * Tile 0: Grün (Gras)
     * Tile 1: Hellbraun (Erde)
     * Tile 2: Dunkelbraun (Nass)
     */
    createPlaceholderTiles() {
        console.warn('Asset "tiles_farm.png" nicht gefunden. Generiere Platzhalter...');
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        
        // Tile 0: Gras
        graphics.fillStyle(0x4caf50); // Grün
        graphics.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
        
        // Tile 1: Erde (Gepflügt)
        graphics.fillStyle(0x795548); // Braun
        graphics.fillRect(TILE_SIZE, 0, TILE_SIZE, TILE_SIZE);
        
        // Tile 2: Erde (Gegossen)
        graphics.fillStyle(0x3e2723); // Dunkelbraun
        graphics.fillRect(TILE_SIZE * 2, 0, TILE_SIZE, TILE_SIZE);

        // Textur generieren (3 Tiles breit, 1 hoch)
        graphics.generateTexture('tiles_farm', TILE_SIZE * 3, TILE_SIZE);
    }
}