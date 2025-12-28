// src/data/GridManager.js
import { GRID_WIDTH, GRID_HEIGHT, BITS, SOIL } from '../core/Constants.js';

export default class GridManager {
    constructor() {
        // Ein einziges Array für die gesamte Farm (Speicheroptimierung) 
        this.width = GRID_WIDTH;
        this.height = GRID_HEIGHT;
        this.buffer = new Uint16Array(this.width * this.height);
        
        console.log(`GridManager initialisiert: ${this.buffer.byteLength} Bytes Speicher belegt.`);
        
        // Debug: Ein paar Testdaten setzen
        this.debugInit();
    }

    // Index-Berechnung: x + y * width
    _getIndex(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return -1;
        return x + (y * this.width);
    }

    /**
     * Setzt einen spezifischen Wert in einen Bit-Bereich
     * @param {number} x - Grid X
     * @param {number} y - Grid Y
     * @param {object} bitDef - Definition aus Constants.BITS (MASK, SHIFT)
     * @param {number} value - Der zu setzende Wert
     */
    _setBitValue(x, y, bitDef, value) {
        const index = this._getIndex(x, y);
        if (index === -1) return;

        let currentData = this.buffer[index];
        
        // 1. Lösche die alten Bits in diesem Bereich (Reset)
        // ~(MASK << SHIFT) erstellt eine Maske, die überall 1 ist, außer im Zielbereich
        const clearMask = ~(bitDef.MASK << bitDef.SHIFT);
        currentData &= clearMask;

        // 2. Setze die neuen Bits
        // value & bitDef.MASK stellt sicher, dass der Wert nicht zu groß ist (Overflow Schutz)
        const newBits = (value & bitDef.MASK) << bitDef.SHIFT;
        
        // 3. Kombinieren und speichern
        this.buffer[index] = currentData | newBits;
    }

    /**
     * Liest einen Wert aus einem Bit-Bereich
     */
    _getBitValue(x, y, bitDef) {
        const index = this._getIndex(x, y);
        if (index === -1) return 0;

        const data = this.buffer[index];
        return (data >> bitDef.SHIFT) & bitDef.MASK;
    }

    // --- Public API ---

    getRawData(x, y) {
        const index = this._getIndex(x, y);
        return index !== -1 ? this.buffer[index] : 0;
    }

    // Boden bearbeiten (Pflügen)
    tillSoil(x, y) {
        // Nur pflügen, wenn Boden "Normal" ist (Vereinfachte Logik)
        const currentSoil = this._getBitValue(x, y, BITS.SOIL);
        if (currentSoil === SOIL.NORMAL) {
            this._setBitValue(x, y, BITS.SOIL, SOIL.HOED);
            return true; // Erfolgreich geändert
        }
        return false;
    }

    // Boden gießen
    waterSoil(x, y) {
        const currentSoil = this._getBitValue(x, y, BITS.SOIL);
        // Man kann nur gepflügten Boden gießen
        if (currentSoil === SOIL.HOED) {
            this._setBitValue(x, y, BITS.SOIL, SOIL.WATERED);
            return true;
        }
        return false;
    }

    getSoilState(x, y) {
        return this._getBitValue(x, y, BITS.SOIL);
    }
    
    getObjectState(x, y) {
        return this._getBitValue(x, y, BITS.OBJECT);
    }

    // Füllt das Grid mit etwas Test-Rauschen für die Visualisierung
    debugInit() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                // Zufällig Bodenstatus setzen (10% Chance auf "Gepflügt")
                if (Math.random() < 0.1) {
                    this.tillSoil(x, y);
                    // 50% Chance, dass gepflügter Boden gegossen ist
                    if (Math.random() < 0.5) this.waterSoil(x, y);
                }
            }
        }
    }
}