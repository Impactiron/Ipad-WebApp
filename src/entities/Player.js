// src/entities/Player.js
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

        // --- Auto-Scaling Logik ---
        // Passt HD-Assets auf das 16px Grid an
        const rawHeight = this.height;
        if (rawHeight > TILE_SIZE) {
            const scaleFactor = TILE_SIZE / rawHeight;
            this.setScale(scaleFactor);
            
            // Hitbox anpassen (kleiner als Sprite für besseres Gefühl)
            this.body.setSize(this.width * 0.6, this.height * 0.6);
            this.body.setOffset(this.width * 0.2, this.height * 0.4);
        } else {
            this.body.setSize(TILE_SIZE * 0.8, TILE_SIZE * 0.8);
        }

        this.setCollideWorldBounds(true);
        this.direction = 'down';
    }

    update(time, delta) {
        const body = this.body;
        body.setVelocity(0);

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

        // Normalisierung (verhindert schnelles diagonales Gehen)
        if (body.velocity.x !== 0 && body.velocity.y !== 0) {
            body.velocity.normalize().scale(this.speed);
        }

        this._updateAnimation();
    }

    _updateAnimation() {
        const velocity = this.body.velocity;

        if (velocity.length() > 0) {
            // Bewegung
            if (this.direction === 'left') this.anims.play('walk-left', true);
            else if (this.direction === 'right') this.anims.play('walk-right', true);
            else if (this.direction === 'up') this.anims.play('walk-up', true);
            else this.anims.play('walk-down', true);
        } else {
            // Stillstand
            if (this.direction === 'left') this.anims.play('idle-left', true);
            else if (this.direction === 'right') this.anims.play('idle-right', true);
            else if (this.direction === 'up') this.anims.play('idle-up', true);
            else this.anims.play('idle-down', true);
        }
    }
}