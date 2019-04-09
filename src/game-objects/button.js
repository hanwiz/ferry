// graphics button using spritesheet with rest, hover, active frames
export class Button extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, rest, hover, active, pushedDownCallback, pushedUpCallback) {
    super(scene, x, y, texture);

    // add this to the scene...
    scene.add.existing(this);

    this.restFrame = rest;
    this.hoverFrame = hover;
    this.activeFrame = active;

    this.setFrame(rest);

    this.setInteractive({
        useHandCursor: true
      })
      .on('pointerover', () => this.enterButtonHoverState())
      .on('pointerout', () => this.enterButtonRestState())
      .on('pointerdown', () => { this.enterButtonActiveState(); if (pushedDownCallback !== undefined) pushedDownCallback(); })
      .on('pointerup', () => { this.enterButtonDelayedHoverState(); if (pushedUpCallback !== undefined) pushedUpCallback(); });
  }

  enterButtonHoverState() {
    this.setFrame(this.hoverFrame);
  }

  enterButtonDelayedHoverState() {
    let that = this;
    // to give some time for show pushed button
    setTimeout(function () {
      that.setFrame(that.hoverFrame);
    }, 200);
  }

  enterButtonRestState() {
    let that = this;
    // without this, if user pushed button and leaves quickly, hover state remains.
    setTimeout(function () {
      that.setFrame(that.restFrame);
    }, 200);
  }

  enterButtonActiveState() {
    this.setFrame(this.activeFrame);
  }
}