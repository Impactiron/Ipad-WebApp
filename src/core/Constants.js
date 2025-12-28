// src/core/Constants.js

/**
 * BIT-LAYOUT (16-Bit Integer pro Tile)
 * ------------------------------------
 * Bits 0-3  (4 Bits): Object (Stein, Zaun, Unkraut)
 * Bits 4-6  (3 Bits): Soil (Bodenstatus)
 * Bits 7-10 (4 Bits): Crop (Pflanzen-ID)
 * Bits 11-13(3 Bits): Stage (Wachstumsstufe)
 * Bits 14-15(2 Bits): Reserviert / Unused
 */

export const TILE_SIZE = 16; // Pixelgröße (SNES Standard)
export const GRID_WIDTH = 60; // Farm Breite in Tiles 
export const GRID_HEIGHT = 57; // Farm Höhe in Tiles 

// Bit-Masken und Shifts für effiziente Datenmanipulation
export const BITS = {
    OBJECT: { MASK: 0xF, SHIFT: 0 },   // 0000 0000 0000 1111
    SOIL:   { MASK: 0x7, SHIFT: 4 },   // 0000 0000 0111 0000
    CROP:   { MASK: 0xF, SHIFT: 7 },   // 0000 0111 1000 0000
    STAGE:  { MASK: 0x7, SHIFT: 11 }   // 0011 1000 0000 0000
};

// IDs für Objekte (Bits 0-3)
export const OBJECTS = {
    NONE: 0,
    WEED: 1,
    STONE: 2,
    WOOD: 3,
    FENCE: 4
};

// IDs für Bodenstatus (Bits 4-6)
export const SOIL = {
    NORMAL: 0,
    HOED: 1,    // Gepflügt
    WATERED: 2  // Gegossen
};