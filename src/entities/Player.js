// src/entities/Player.js
import { TILE_SIZE } from '../core/Constants.js';

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        // Konstruktor der Elternklasse (Sprite) aufrufen
        // 'char_jack' ist der Key, unter dem wir das Spritesheet laden
        super(scene, x, y, 'char_jack');

        // Referenz zur Szene speichern
        this.scene = scene;

        // Sprite zur Szene und zur Physik-Engine hinzufügen
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // --- Physik Setup ---
        this.setCollideWorldBounds(true); // Kann nicht aus der Welt laufen
        
        // Hitbox anpassen: Wir wollen, dass nur die Füße kollidieren (für besseres Gefühl hinter Objekten)
        // Annahme: Sprite ist 16x24. Hitbox: 10x8 Pixel unten an den Füßen.
        this.body.setSize(10, 8);
        this.body.setOffset(3, 16); 

        // --- Status Variablen ---
        this.speed = 80; // Pixel pro Sekunde
        this.facing = 'down'; // Blickrichtung ('down', 'up', 'left', 'right')
        
        // Letzte Eingabe speichern für Interaktionen
        this.lastDirectionVector = new Phaser.Math.Vector2(0, 1); 

        // Animationen erstellen (falls noch nicht existent)
        this.createAnimations();
    }

    createAnimations() {
        const anims = this.scene.anims;
        if (anims.exists('walk-down')) return;

        // Wir gehen von einem 16x24 Spritesheet aus mit 4 Spalten
        // Row 0: Down, Row 1: Up, Row 2: Left, Row 3: Right
        // Frame-Rate 8 ist gemütlich für RPGs
        
        anims.create({
            key: 'walk-down',
            frames: anims.generateFrameNumbers('char_jack', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1
        });

        anims.create({
            key: 'walk-up',
            frames: anims.generateFrameNumbers('char_jack', { start: 4, end: 7 }),
            frameRate: 8,
            repeat: -1
        });

        anims.create({
            key: 'walk-left',
            frames: anims.generateFrameNumbers('char_jack', { start: 8, end: 11 }),
            frameRate: 8,
            repeat: -1
        });

        // Falls das Sheet keine Right-Animation hat, könnten wir 'left' spiegeln.
        // Hier nehmen wir an, Row 3 ist rechts (Standard RPG Maker Format oft anders, aber wir testen das).
        anims.create({
            key: 'walk-right',
            frames: anims.generateFrameNumbers('char_jack', { start: 12, end: 15 }),
            frameRate: 8,
            repeat: -1
        });
        
        // Idle Animationen (jeweils der erste Frame der Lauf-Animation)
        anims.create({ key: 'idle-down', frames: [ { key: 'char_jack', frame: 0 } ], frameRate: 1 });
        anims.create({ key: 'idle-up', frames: [ { key: 'char_jack', frame: 4 } ], frameRate: 1 });
        anims.create({ key: 'idle-left', frames: [ { key: 'char_jack', frame: 8 } ], frameRate: 1 });
        anims.create({ key: 'idle-right', frames: [ { key: 'char_jack', frame: 12 } ], frameRate: 1 });
    }

    update(cursors) {
        if (!cursors) return;

        // Reset Geschwindigkeit
        this.setVelocity(0);
        let moving = false;

        // Eingabe verarbeiten
        // WICHTIG: Wir priorisieren Y-Achse für "schöneres" Laufen, oder nutzen Vektor-Normalisierung
        let dx = 0;
        let dy = 0;

        if (cursors.left.isDown) dx = -1;
        else if (cursors.right.isDown) dx = 1;

        if (cursors.up.isDown) dy = -1;
        else if (cursors.down.isDown) dy = 1;

        // Bewegung anwenden
        if (dx !== 0 || dy !== 0) {
            moving = true;
            
            // Vektor normalisieren, damit diagonales Laufen nicht schneller ist
            const vec = new Phaser.Math.Vector2(dx, dy).normalize().scale(this.speed);
            this.setVelocity(vec.x, vec.y);

            // Blickrichtung und Animation setzen
            if (dy < 0) {
                this.facing = 'up';
                this.anims.play('walk-up', true);
            } else if (dy > 0) {
                this.facing = 'down';
                this.anims.play('walk-down', true);
            } else if (dx < 0) {
                this.facing = 'left';
                this.anims.play('walk-left', true);
            } else if (dx > 0) {
                this.facing = 'right';
                this.anims.play('walk-right', true);
            }

            // Vektor speichern für Interaction (Targeting)
            // Bei Diagonalbewegung bevorzugen wir die letzte dominante Achse oder einfach den aktuellen Vektor
            this.lastDirectionVector.set(dx, dy).normalize();
        } else {
            // Keine Bewegung -> Idle Animation basierend auf letzter Richtung
            this.anims.play(`idle-${this.facing}`, true);
        }
    }

    /**
     * Berechnet die Grid-Koordinaten des Tiles, das direkt vor dem Spieler liegt.
     * Wichtig für Werkzeug-Nutzung und Interaktion.
     * @returns {Phaser.Math.Vector2} {x, y} in Grid-Koordinaten
     */
    getTargetPosition() {
        // Position des Spielers (Mittelpunkt der Füße)
        const playerCenter = this.body.center;

        // Wir addieren einen halben Tile in Blickrichtung
        const targetX = playerCenter.x + (this.lastDirectionVector.x * TILE_SIZE);
        const targetY = playerCenter.y + (this.lastDirectionVector.y * TILE_SIZE);

        // Umrechnung in Grid-Koordinaten
        const gridX = Math.floor(targetX / TILE_SIZE);
        const gridY = Math.floor(targetY / TILE_SIZE);

        return new Phaser.Math.Vector2(gridX, gridY);
    }
}// src/entities/Player.js
import { TILE_SIZE } from '../core/Constants.js';

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'char_jack');

        // Zur Szene und Physik-Welt hinzufügen
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // --- Konfiguration ---
        this.speed = 80; // Pixel pro Sekunde
        this.cursors = scene.input.keyboard.createCursorKeys();

        // --- Auto-Scaling Logik (wie angefordert) ---
        // Passt HD-Assets auf das 16px Grid an
        const rawHeight = this.height;
        if (rawHeight > TILE_SIZE) {
            const scaleFactor = TILE_SIZE / rawHeight;
            this.setScale(scaleFactor);
            
            // Hitbox anpassen, damit sie etwas kleiner als das Sprite ist (besseres Gefühl)
            // Wir nutzen die originalen Dimensionen für setSize, da Physics sich am Scale orientiert
            this.body.setSize(this.width * 0.6, this.height * 0.6);
            this.body.setOffset(this.width * 0.2, this.height * 0.4);
        } else {
            // Standard Hitbox für kleine Sprites
            this.body.setSize(TILE_SIZE * 0.8, TILE_SIZE * 0.8);
        }

        // Kollision mit Weltgrenzen
        this.setCollideWorldBounds(true);
        
        // Initialer State
        this.direction = 'down';
    }

    update(time, delta) {
        // Vektor für Bewegung zurücksetzen
        const body = this.body;
        body.setVelocity(0);

        // Input lesen
        const left = this.cursors.left.isDown;
        const right = this.cursors.right.isDown;
        const up = this.cursors.up.isDown;
        const down = this.cursors.down.isDown;

        // Horizontale Bewegung
        if (left) {
            body.setVelocityX(-this.speed);
            this.direction = 'left';
        } else if (right) {
            body.setVelocityX(this.speed);
            this.direction = 'right';
        }

        // Vertikale Bewegung
        if (up) {
            body.setVelocityY(-this.speed);
            this.direction = 'up';
        } else if (down) {
            body.setVelocityY(this.speed);
            this.direction = 'down';
        }

        // Vektor normalisieren (verhindert, dass diagonal schneller ist)
        // Phaser's Arcade Physics macht das nicht automatisch bei direkter Velocity-Setzung,
        // aber wir nutzen hier einfache Velocity. Für exakte Normalisierung:
        if (body.velocity.x !== 0 && body.velocity.y !== 0) {
            body.velocity.normalize().scale(this.speed);
        }

        // Animation abspielen
        this._updateAnimation();
    }

    _updateAnimation() {
        const velocity = this.body.velocity;

        if (velocity.length() > 0) {
            // Bewegung -> Walk Animation
            if (this.direction === 'left') this.anims.play('walk-left', true);
            else if (this.direction === 'right') this.anims.play('walk-right', true);
            else if (this.direction === 'up') this.anims.play('walk-up', true);
            else this.anims.play('walk-down', true);
        } else {
            // Stillstand -> Idle Animation
            if (this.direction === 'left') this.anims.play('idle-left', true);
            else if (this.direction === 'right') this.anims.play('idle-right', true);
            else if (this.direction === 'up') this.anims.play('idle-up', true);
            else this.anims.play('idle-down', true);
        }
    }
}