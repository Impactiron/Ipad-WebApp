// src/entities/Player.js
import { TILE_SIZE } from '../core/Constants.js';

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        // "char_jack" ist der Key, den wir im Preload laden werden
        super(scene, x, y, 'char_jack');

        // 1. Zur Szene und zum Physik-System hinzufügen
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // 2. Skalierung & Hitbox (WICHTIG für Retro-Look)
        // Wir wollen, dass der Charakter etwa 1 Tile groß wirkt, auch wenn das Sprite größer ist.
        // Das Original Harvest Moon SNES Sprite ist oft ca 16x24. 
        // Wir passen die Hitbox an die Füße an.
        
        // Hitbox verkleinern (für präziseres Gefühl bei Kollisionen)
        // Breite: 60% des Sprites, Höhe: 40% des Sprites (nur die Füße)
        this.body.setSize(this.width * 0.6, this.height * 0.4);
        this.body.setOffset(this.width * 0.2, this.height * 0.6);

        this.body.setCollideWorldBounds(true); // Kann nicht aus der Welt laufen
        
        // Geschwindigkeit (Pixel pro Sekunde)
        this.speed = 80; 
        
        // 3. Animationen initialisieren
        this.createAnimations(scene);
    }

    createAnimations(scene) {
        // Wir prüfen, ob die Animationen schon existieren, um Warnungen zu vermeiden
        if (!scene.anims.exists('walk-down')) {
            // Annahme: Sprite-Sheet Layout (4 Zeilen, 4 Spalten)
            // Reihe 0: Unten, Reihe 1: Oben, Reihe 2: Links, Reihe 3: Rechts (oder gespiegelt)
            
            scene.anims.create({
                key: 'walk-down',
                frames: scene.anims.generateFrameNumbers('char_jack', { start: 0, end: 3 }),
                frameRate: 8,
                repeat: -1
            });
            scene.anims.create({
                key: 'walk-up',
                frames: scene.anims.generateFrameNumbers('char_jack', { start: 4, end: 7 }),
                frameRate: 8,
                repeat: -1
            });
            scene.anims.create({
                key: 'walk-left',
                frames: scene.anims.generateFrameNumbers('char_jack', { start: 8, end: 11 }),
                frameRate: 8,
                repeat: -1
            });// src/entities/Player.js
import { TILE_SIZE } from '../core/Constants.js';

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'char_jack');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        // --- SKALIERUNG ---
        // Das Asset ist ca 92px hoch. Ein Tile ist 16px.
        // Der Spieler sollte etwas größer als ein Tile sein (ca. 22-24px).
        // Scale Factor = 22 / 92 ≈ 0.24
        this.setScale(0.24);
        
        // --- HITBOX ---
        // Die Hitbox bezieht sich auf die ORIGINAL Größe des Sprites (unskaliert).
        // Wir wollen eine Hitbox, die nur die Füße abdeckt (zentriert).
        // Original Breite ~112, Höhe ~92.
        
        // Breite: 40% des Bildes
        // Höhe: 20% des Bildes (nur Füße)
        // Offset Y: 80% nach unten geschoben
        this.body.setSize(this.width * 0.4, this.height * 0.2);
        this.body.setOffset(this.width * 0.3, this.height * 0.75);

        this.body.setCollideWorldBounds(true);
        this.speed = 80; 
        
        this.createAnimations(scene);
    }

    createAnimations(scene) {
        // Animationen basierend auf 6 Spalten Layout
        // Zeile 1 (0-5): Walk
        // Zeile 2 (6-11): Axe/Hoe
        // Zeile 3 (12-17): Water
        
        if (!scene.anims.exists('walk-down')) {
            scene.anims.create({
                key: 'walk-down',
                frames: scene.anims.generateFrameNumbers('char_jack', { frames: [0, 1] }),
                frameRate: 6,
                repeat: -1
            });
            scene.anims.create({
                key: 'walk-left',
                frames: scene.anims.generateFrameNumbers('char_jack', { frames: [2, 3] }),
                frameRate: 6,
                repeat: -1
            });
            scene.anims.create({
                key: 'walk-right',
                frames: scene.anims.generateFrameNumbers('char_jack', { frames: [4, 5] }),
                frameRate: 6,
                repeat: -1
            });
            // Fallback für Oben (da Sprite fehlt)
            scene.anims.create({
                key: 'walk-up',
                frames: scene.anims.generateFrameNumbers('char_jack', { frames: [0, 1] }),
                frameRate: 6,
                repeat: -1
            });
        }
    }

    update(cursors) {
        const speed = this.speed;
        this.body.setVelocity(0);

        if (cursors.left.isDown) {
            this.body.setVelocityX(-speed);
            this.anims.play('walk-left', true);
        } else if (cursors.right.isDown) {
            this.body.setVelocityX(speed);
            this.anims.play('walk-right', true);
        } else if (cursors.up.isDown) {
            this.body.setVelocityY(-speed);
            this.anims.play('walk-up', true);
        } else if (cursors.down.isDown) {
            this.body.setVelocityY(speed);
            this.anims.play('walk-down', true);
        } else {
            this.anims.stop();
            if (this.anims.currentAnim) {
                this.anims.setCurrentFrame(this.anims.currentAnim.frames[0]);
            }
        }
    }
}
            scene.anims.create({
                key: 'walk-right',
                // Oft wird rechts nicht extra gezeichnet, sondern links gespiegelt. 
                // Falls du ein "echtes" rechtes Sprite hast, nutze Frames 12-15.
                // Hier nutzen wir Frames 12-15 als Platzhalter für "Rechts".
                frames: scene.anims.generateFrameNumbers('char_jack', { start: 12, end: 15 }),
                frameRate: 8,
                repeat: -1
            });
        }
    }

    update(cursors) {
        const speed = this.speed;
        this.body.setVelocity(0);

        // Movement Logic
        // Priorität: Vertikal oder Horizontal (kein diagonaler Speed-Boost)
        if (cursors.left.isDown) {
            this.body.setVelocityX(-speed);
            this.anims.play('walk-left', true);
        } else if (cursors.right.isDown) {
            this.body.setVelocityX(speed);
            this.anims.play('walk-right', true);
        } else if (cursors.up.isDown) {
            this.body.setVelocityY(-speed);
            this.anims.play('walk-up', true);
        } else if (cursors.down.isDown) {
            this.body.setVelocityY(speed);
            this.anims.play('walk-down', true);
        } else {
            this.anims.stop();
            // Optional: Idle Frame setzen (erster Frame der aktuellen Animation)
            if (this.anims.currentAnim) {
                this.anims.setCurrentFrame(this.anims.currentAnim.frames[0]);
            }
        }
    }
}