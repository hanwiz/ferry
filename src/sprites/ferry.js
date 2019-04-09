// this contains ferry
export class Ferry extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);

    scene.physics.world.enable(this);
    scene.add.existing(this);

    // ferry.displayWidth = 30;
    // ferry.displayHeight = 20;
    this.setScale(0.25, 0.25);
    this.body.setBounce(0.2);
    this.setCollideWorldBounds(true);

    this.ferryDirection = -1; // -1 up, 1 down
    this.ferryStartSpeed = 3; // ferry start up speed by start button
    this.ferryMaxSpeed = 5;   // adjust by resolution
    this.speed = 0;           // suggested speed
    this.ferrySpeed = 0;      // ferry current speed
    this.ferryAccel = 0.4;    // ferry acceleration
    this.load = 0;            // ferry load
  }

  // adjust the ferry real speed with current set speed
  adjustSpeed(timeVelocityChange, speedRatio) {
    while (timeVelocityChange < 0) {
      timeVelocityChange += 100;
      if (Math.abs(this.ferrySpeed) < Math.abs(this.speed)) {
        this.ferrySpeed += this.ferryAccel * this.ferryDirection;
      } else {
        if (Math.abs(this.ferrySpeed) <= this.ferryAccel)
          this.ferrySpeed = 0;
        else
          this.ferrySpeed -= this.ferryAccel * this.ferryDirection;
      }
    }

    // set the speed of ferry
    this.setVelocityY(this.ferrySpeed * speedRatio);

    return timeVelocityChange;
  }
}
