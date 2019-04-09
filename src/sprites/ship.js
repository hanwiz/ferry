// this contains ship or kayak from left or right
export class Ship extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);

    // move inside for better compatibility such as firefox
    this.kayak = false;
    this.shipDirection = 0;
    this.shipSpeed = 0;
    this.shipScale = 0.2;
    this.shipACS = true;           // without ACS, ship not yield automatically
    this.stoppedByACS = false;
    this.timeChangeSpeed = 5000; // every 5 seconds, kayak change its speed
    this.yieldToFerry = false;               // yield no matter what if needed
    this.currentSpeed = 0;
    this.timeSlowDown = 100; // every 0.1 seconds it slow down 0.1
  }
}
