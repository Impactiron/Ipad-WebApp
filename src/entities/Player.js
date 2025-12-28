// src/entities/Player.js
import { TILE_SIZE } from '../core/Constants.js';

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'char_jack');

        // 1. Zur Szene hinzufügen
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // 2. Skalierung für das große 677x369 Asset
        // Das Sprite ist ca. 92px hoch, wir wollen ca. 22px im Spiel.
        this.setScale(0.24);
        
        // 3. Hitbox (nur Füße)
        // Werte basieren auf der Originalgröße (112x92)
        this.body.setSize(this.width * 0.4, this.height * 0.2);
        this.body.setOffset(this.width * 0.3, this.height * 0.75);

        this.body.setCollideWorldBounds(true);
        this.speed = 80; 

        // Richtung speichern (für Interaktion): 'down', 'up', 'left', 'right'
        this.facing = 'down';
        
        this.createAnimations(scene);
    }

    createAnimations(scene) {
        // Prüfen, ob Animationen schon existieren
        if (!scene.anims.exists('walk-down')) {
            
            // UNTEN (Zeile 1: Frames 0, 1)
            scene.anims.create({
                key: 'walk-down',
                frames: scene.anims.generateFrameNumbers('char_jack', { frames: [0, 1] }),
                frameRate: 6,
                repeat: -1
            });

            // LINKS (Zeile 1: Frames 2, 3)
            scene.anims.create({
                key: 'walk-left',
                frames: scene.anims.generateFrameNumbers('char_jack', { frames: [2, 3] }),
                frameRate: 6,
                repeat: -1
            });

            // RECHTS (Zeile 1: Frames 4, 5)
            scene.anims.create({
                key: 'walk-right',
                frames: scene.anims.generateFrameNumbers('char_jack', { frames: [4, 5] }),
                frameRate: 6,
                repeat: -1
            });

            // OBEN (Fallback auf Unten, da Sprite fehlt)
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

        // Bewegung & Animation
        if (cursors.left.isDown) {
            this.body.setVelocityX(-speed);
            this.anims.play('walk-left', true);
            this.facing = 'left';
        } else if (cursors.right.isDown) {
            this.body.setVelocityX(speed);
            this.anims.play('walk-right', true);
            this.facing = 'right';
        } else if (cursors.up.isDown) {
            this.body.setVelocityY(-speed);
            this.anims.play('walk-up', true);
            this.facing = 'up';
        } else if (cursors.down.isDown) {
            this.body.setVelocityY(speed);
            this.anims.play('walk-down', true);
            this.facing = 'down';
        } else {
            this.anims.stop();
            // Idle Frame setzen (erster Frame der aktuellen Animation)
            if (this.anims.currentAnim) {
                this.anims.setCurrentFrame(this.anims.currentAnim.frames[0]);
            }
        }
    }
}
