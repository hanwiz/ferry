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
    this.shipAccel = 0.2;    // ship accel
  }

  // speaker warning activating...
  processTasks(child, circleHorn, rectBounds, delta, speedFactor, stopRadius, ferry, speakerWarning) {
    if (speakerWarning && ferry.ferryDirection * child.shipDirection === -1 && Phaser.Geom.Intersects.CircleToRectangle(circleHorn, rectBounds)) {
      //child.yieldToFerry = true;
      //child.body.moves = false;

      console.log("Speaker debug", child, child.timeSlowDown, child.shipSpeed, delta, speedFactor);

      // only collision possible boats affected by speaker button
      if ((ferry.ferryDirection === -1 && child.y - child.displayHeight / 2 < ferry.y + ferry.displayHeight / 2) || // ferry down to up
        (ferry.ferryDirection === 1 && child.y + child.displayHeight / 2 > ferry.y - ferry.displayHeight / 2)) { // ferry up to down
        // left to right
        if ((child.shipDirection === 1 && child.x + child.displayWidth / 2 < ferry.x - stopRadius / 2) || // ship left to right
          (child.shipDirection === -1 && child.x - child.displayWidth / 2 > ferry.x + stopRadius / 2)) { // ship right to left
          child.timeSlowDown -= delta * speedFactor;

          while (child.timeSlowDown <= 0) {
            child.timeSlowDown += 100;
            child.shipSpeed = (Math.abs(child.shipSpeed) <= child.shipAccel) ? 0 : child.shipSpeed - child.shipAccel * child.shipDirection;
          }
        }
      }
      //console.log(child.shipSpeed);
    } else if (!child.stoppedByACS) {
      //child.body.moves = true;
      child.timeSlowDown -= delta * speedFactor;
      while (child.timeSlowDown <= 0) {
        child.timeSlowDown += 100;
        if (Math.abs(child.shipSpeed) < Math.abs(child.currentSpeed)) { // before
          child.shipSpeed += child.shipAccel * child.shipDirection;
        }
      }
    }
  }
}
