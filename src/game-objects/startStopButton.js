// Start/Stop button using spritesheet
export class StartStopButton extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, start, pushedDownCallback) {
    super(scene, x, y, texture);

    // add this to the scene...
    scene.add.existing(this);

    this.scene = scene;

    this.setFrame(start);

    this.setInteractive({
        useHandCursor: true
      })
      .on('pointerover', () => this.enterButtonHoverState())
      .on('pointerout', () => this.enterButtonRestState())
      .on('pointerdown', () => { this.enterButtonActiveState(); if (pushedDownCallback !== undefined) pushedDownCallback(); })
      .on('pointerup', () => { this.enterButtonDelayedHoverState(); if (pushedUpCallback !== undefined) pushedUpCallback(); });
  }

  enterButtonHoverState() {
    this.setFrame((this.scene.ferry.speed === 0) ? 1 : 2);
  }

  enterButtonDelayedHoverState() {
  }

  enterButtonRestState() {
    this.setFrame((this.scene.ferry.speed === 0) ? 0 : 3);
  }

  enterButtonActiveState() {
    this.setFrame((this.scene.ferry.speed === 0) ? 2 : 1);
  }
}