import channelImg from "../assets/channel2.png";
import platformImg from "../assets/platform.png";
import ferryImg from "../assets/ferry.png";
import boatImg from "../assets/boat.png";
import kayakImg from "../assets/kayak.png";
import startStopImg from "../assets/startStop.png";
import speedUpImg from "../assets/speedUp.png";
import speedDownImg from "../assets/speedDown.png";
import buttonsImg from "../assets/buttons.png";
import statusImg from "../assets/status.png";
import weatherImg from "../assets/weather.png";
import personImg from "../assets/person.png";
import portImg from "../assets/port.png";
import gothicImg from "../assets/gothic.png";
import gothicBImg from "../assets/gothicB.png";
import gothicXml from "../assets/gothic.xml";

import { Ship } from "../sprites/ship";
import { Ferry } from "../sprites/ferry";
import { Button } from "../game-objects/button";
import { StartStopButton } from "../game-objects/startStopButton";

// global constants
var meterPerPixel = 90 / 465; // Canal Length 90m / 465 pixel
var knToMPS = 0.514; // 2.6556 ~~~ 8/3
// actual speed in current resolution (720)
var speedRatioOriginal = knToMPS / meterPerPixel; // 2.6556 ~~~~ 8/3
var speedFactor = 1;
var speedRatio = speedRatioOriginal * speedFactor; // 2.6556 ~~~~ 8/3 // for debugging
var haloRadius = Math.floor(10 / meterPerPixel); // 4 + 5 = 9m
var stopRadius = Math.floor(6.5 / meterPerPixel); // 4 + 1.5 = 5.5m
var hornRadius = Math.floor(20 / meterPerPixel);

// boat starting position
var upY = 170;          // highest position
var downY = 450;        // loweest position
var leftX = 0;          // left screen start point
var rightX = 1000;      // screen width excluding right UI
var adjustX = 64;       // max boat size 320 * 0.3 = 96, 48 is the minimum

// text location for right bar
var staticTextX = 1014;    // right bar static x loc
var staticResultX = 1224;  // right bar value x loc

// currently not used because of flickers
var featurePasengerText = false;

// global variables
var scenario = 1;    // current scenario
var totalScore = 0;  // total score
var sceneObj;        // scene object accessible

var minWidth = 480;  // minimum width needed
var minHeight = 270; // minimum Height needed

// should have the ratio of 16:9
var maxWidth = 1280; // maximum width
var maxHeight = 720; // maximum width

function resizeApp()
{
  // Width-height-ratio of game resolution
  let game_ratio = (1280) / (720);

  // Make div full height of browser and keep the ratio of game resolution
  let div = document.getElementById('ferry-app');

  if (window.innerWidth < minWidth || window.innerHeight < minHeight) {
    div.style.width = minWidth + 'px';
    div.style.height = (minWidth / game_ratio) + 'px';
  } else if (window.innerWidth > maxWidth) {
    if (window.innerHeight < maxHeight) {
      div.style.width = (window.innerHeight * game_ratio) + 'px';
      div.style.height = window.innerHeight + 'px';
    } else {
      div.style.width = maxWidth + 'px';
      div.style.height = maxHeight + 'px';
    }
  } else if (window.innerWidth / window.innerHeight >= game_ratio) {
    div.style.width = (window.innerHeight * game_ratio) + 'px';
    div.style.height = window.innerHeight + 'px';
  } else {
    div.style.width = window.innerWidth + 'px';
    div.style.height = (window.innerWidth / game_ratio) + 'px';
  }

  console.log(window.innerWidth, window.innerHeight, div.style.width, div.style.height);

  // Check if device DPI messes up the width-height-ratio
  // let canvas = document.getElementsByTagName('canvas')[0];

  // if (canvas !== undefined) {
  //   let dpi_w = (parseInt(div.style.width) / canvas.width);
  //   let dpi_h = (parseInt(div.style.height) / canvas.height);
  //   console.log("Resizing: ", div.style.width, canvas.width, div.style.height, canvas.height, dpi_w, dpi_h);

  //   if (dpi_w !== dpi_h) {
  //     let height = window.innerHeight * (dpi_w / dpi_h);
  //     let width = height * game_ratio;

  //     canvas.style.width = width + 'px';
  //     canvas.style.height = height + 'px';
  //   }
  // }
}

// Add to resize event
window.addEventListener('resize', resizeApp);

// Set correct size when page loads the first time
resizeApp();

// initialize to the condition except senario
function init(scene) {
  scene.timeLeft = 300; // 5 minutes

  scene.haloStatus = 0; // 0 green 1 yellow 2 red
  scene.atDock = true;  // ferry is at port
  scene.loading = true; // false when it is arrived at the other ports
  scene.peopleLower = 20;
  scene.peopleUpper = 20;

  scene.score = 0;
  scene.cross = 0;
  scene.scenarioActivated = false;
  scene.stopRequested = false;

  // space 0 to 10 between 250 and 450 with size of 20
  scene.occupied = {};
  for(var i=0;i<= 11;i++) {
    scene.occupied[i] = null;
  }
  // ship init
  // canoe init
  scene.gameover = false;
  scene.maintenanceCalled = false;
  scene.maintenanceNeeded = false;
  scene.ACSFailed = false;
  scene.windSpeed = 1;
  scene.falseStartWind  = false;
  scene.engineFailed = 0;
  scene.thrusterFailed = false;
  scene.timePassed = 0;
  scene.totalBoats = 9;

  scene.preTimeElapsed500 = -1;
  scene.timeVelocityChange = 100;

  // warning flag...
  scene.speakerWarning = false;
}

export class GameScene extends Phaser.Scene {
  preload() {
    this.load.image('channel', channelImg);
    this.load.image('ground', platformImg);
    this.load.image('ferry', ferryImg);
    this.load.spritesheet('boat', boatImg, { frameWidth: 320, frameHeight: 118 });
    this.load.spritesheet('kayak', kayakImg, { frameWidth: 213, frameHeight: 133 });
    //this.load.svg('passengerWaiting', 'assets/passenger-waiting.svg', {width: 200, height: 30}); // , { width: 200, height: 100 });
    //this.load.svg('cartman2', 'assets/svg/cartman.svg', { width: 416, height: 388 })
    this.load.bitmapFont('bigFont', gothicImg, gothicXml);  // gothic white
    this.load.bitmapFont('bigFontB', gothicBImg, gothicXml);  // nanum gothic black

    this.load.spritesheet('startStop', startStopImg, {
      frameWidth: 274,
      frameHeight: 64
    });
    this.load.spritesheet('speedUp', speedUpImg, {
      frameWidth: 274,
      frameHeight: 64
    });
    this.load.spritesheet('speedDown', speedDownImg, {
      frameWidth: 274,
      frameHeight: 64
    });
    this.load.spritesheet('buttons', buttonsImg, {
      frameWidth: 64,
      frameHeight: 64
    });
    this.load.spritesheet('statusLight', statusImg, {
      frameWidth: 32,
      frameHeight: 32
    });
    this.load.image('weather', weatherImg);
    this.load.image('person', personImg);
    this.load.image('port', portImg);
  }

  create() {
    init(this);       // initialize...
    sceneObj = this;  // setting sceneObj for later use by outside or event function

    // add channel background image
    this.add.image(500, 328, 'channel'); // 727 * 371

    this.platforms = this.physics.add.staticGroup();

    // upper ground
    this.platforms.create(800, 16, 'ground').setScale(4).refreshBody();
    this.platforms.create(508, 92, 'port').setScale(0.8).refreshBody();
    this.add.image(498, 92, 'person');
    this.peopleUpperText = this.add.bitmapText(508, 79, 'bigFontB', this.peopleUpper, 20);

    // lower ground
    this.platforms.create(800, 660, 'ground').setScale(4).refreshBody();
    this.platforms.create(508, 584, 'port').setScale(0.8).refreshBody();
    this.add.image(498, 584, 'person');
    this.peopleLowerText = this.add.bitmapText(508, 571, 'bigFontB', this.peopleLower, 20);

    // add right status bar area
    var rect = new Phaser.Geom.Rectangle(1000, 80, 280, 800);
    this.graphics = this.add.graphics({
      fillStyle: {
        color: 0xffffff
      }
    });
    this.graphics.fillRectShape(rect);
    this.graphics.setDepth(1);
    this.graphics.lineStyle(4, 0x000, 1);
    this.graphics.strokeRect(1000, 80, 278, 60);
    this.graphics.strokeRect(1000, 140, 278, 160);
    this.graphics.strokeRect(1000, 300, 278, 218);
    this.graphics.strokeRect(1000, 518, 278, 200);

    // add graphics for primary halo area
    this.graphicsBoundary = this.add.graphics({
      fillStyle: {
        color: 0xffffff
      }
    });

    // create buttons and assign
    this.startStop = new StartStopButton(this, 200, 660, 'startStop', 0, () => this.startStopPushedDown(this));
    this.speedUp = new Button(this, 500, 640, 'speedUp', 0, 1, 2, () => this.speedUpPushedDown(this)).setScale(0.5, 0.5);
    this.speedDown = new Button(this, 500, 680, 'speedDown', 0, 1, 2, () => this.speedDownPushedDown(this)).setScale(0.5, 0.5);
    this.speaker = new Button(this, 700, 660, 'buttons', 3, 4, 5, () => this.speakerButtonPushedDown(this), () => this.speakerButtonPushedUp(this));
    this.mic = new Button(this, 800, 660, 'buttons', 0, 1, 2);
    this.tools = new Button(this, 900, 660, 'buttons', 6, 7, 8, () => this.toolsButtonPushedDown(this));

    // create ferry and setup with platforms
    this.ferry = new Ferry(this, 508, 548, 'ferry');
    this.physics.add.collider(this.ferry, this.platforms, this.hitPlatform, null, this);

    // keyboard process
    this.cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.on('keyup', function (event) {
      console.log(event, event.keyCode);
      if (event.keyCode >= 49 && event.keyCode <=52) {  // num 1 to 4
        scenario = event.keyCode - 49;
        sceneObj.gameOver(-1, sceneObj);
      }

      if (event.keyCode === 37) { // arrow left
        speedFactor = (speedFactor < 2) ? 1 : speedFactor - 1;
        speedRatio = speedFactor * speedRatioOriginal;
      }

      if (event.keyCode === 39) { // arrow right
        speedFactor = (speedFactor > 3) ? 4 : speedFactor + 1;
        speedRatio = speedFactor * speedRatioOriginal;
      }

      if (event.keyCode === 32) { // space
        sceneObj.setSpeed((sceneObj.ferry.speed === 0) ? sceneObj.ferry.ferryDirection * sceneObj.ferry.ferryStartSpeed : 0, sceneObj);
      }
    });

    // create ships - 4 ships and 5 kayaks
    this.ships = this.physics.add.group();
    for(var i=0; i<9; i++) {
      var ship, ship2, x, y, dir, shipImage, shipScale, velocity;
      if (i< 2 || i >=4 && i <=5)  { // ship to go rightward
        dir = 1;
        x = Phaser.Math.Between(-rightX / 4, -adjustX);
      } else { // ship to go leftward
        dir = -1;
        x = Phaser.Math.Between(rightX + adjustX, rightX * 5 / 4);
      }

      if (i<4) {
        shipScale =  Phaser.Math.Between(20, 30) / 100;
        velocity = Phaser.Math.Between(2, 5) ;
        shipImage = 'boat';
        if (i>1) velocity = -velocity;
      } else { // kayak
        shipImage = 'kayak';
        shipScale = 0.15;
        velocity = Phaser.Math.Between(1, 3);
        if (i>5) velocity = -velocity;
      }

      ship = new Ship(this, x, y, shipImage);

      if (i>=4) ship.kayak = true;

      ship.y = y = this.findAvailable(ship);
      //ship.setScale(shipScale);
      //ship.setVelocityX(velocity);

      ship.shipDirection = dir;
      ship.shipSpeed = velocity;
      ship.currentSpeed = velocity;
      ship.shipScale = shipScale;
      console.log(shipImage, x, y, shipScale, dir, velocity, ship.timeSlowDown);
      this.ships.add(ship, true);
      //console.log(ships2);
    }

    this.ships.children.iterate(function (child) {
      child.setVelocityX( child.shipSpeed * speedRatio );
      if (child.shipDirection === 1) {
        child.setFrame(1);
      }
      child.setScale(child.shipScale);
    });

    this.physics.add.collider(this.ships, this.platforms);

    this.add.bitmapText(32, 16, 'bigFont', 'AutoFerry Control Simulation Game', 32);
    this.add.bitmapText(staticTextX, 16, 'bigFont', 'Scenario', 32);
    this.scenarioText = this.add.bitmapText(staticResultX - 40, 16, 'bigFont', scenario, 32);

    // Camera and Thrusters
    this.addStaticText(staticTextX, 100, "Camera", this);
    this.add.sprite(staticResultX, 110, 'statusLight', 0).setScale(0.7, 0.7).setDepth(1);

    this.addStaticText(staticTextX, 160, "Thruster A", this);
    this.thrusterA = this.add.sprite(staticResultX, 170, 'statusLight', 0).setScale(0.7, 0.7);
    this.thrusterA.setDepth(1);
    this.addStaticText(staticTextX, 192, "Thruster B", this);
    this.thrusterB = this.add.sprite(staticResultX, 202, 'statusLight', 0).setScale(0.7, 0.7);;
    this.thrusterB.setDepth(1);
    this.addStaticText(staticTextX, 224, "Thruster C", this);
    this.thrusterC = this.add.sprite(staticResultX, 234, 'statusLight', 0).setScale(0.7, 0.7);;
    this.thrusterC.setDepth(1);
    this.addStaticText(staticTextX, 256, "Thruster D", this);
    this.thrusterD = this.add.sprite(staticResultX, 266, 'statusLight', 0).setScale(0.7, 0.7);;
    this.thrusterD.setDepth(1);

    this.addStaticText(staticTextX, 320, "Ferry Speed", this);
    this.speedText = this.add.bitmapText(staticResultX - 30, 320 - 6, 'bigFontB', '0 kn', 24).setDepth(1);

    this.addStaticText(staticTextX, 352, 'Passenger #', this);
    this.loadText = this.add.bitmapText(staticResultX - 30, 352 - 6, 'bigFontB', '0', 24).setDepth(1);

    this.addStaticText(staticTextX, 384, 'Wind Speed', this);
    // remove it because of flickers...-_-
    //passengerText = this.add.bitmapText(ferry.x - 5, ferry.y - 4, 'font', '0', 10 ); // { fontSize: '18px', fill: '#fff' });

    if (scenario === 4) this.windSpeed = 20;
    this.windSpeedText = this.add.bitmapText(staticResultX - 30, 384 - 6, 'bigFontB', this.windSpeed + ' kn', 24 ).setDepth(1);

    this.addStaticText(staticTextX, 416, 'Weather:', this);
    this.weatherImage = this.add.image(1180, 464, 'weather').setDepth(1);

    // emergency from passengers
    this.addStaticText(staticTextX, 538, "Emergency Status:", this);
    this.emergency = this.add.sprite(staticResultX - 80, 585, 'statusLight', 0).setScale(0.7, 0.7).setDepth(1);
    this.addStaticText(staticTextX, 610, "Communications:", this);
    this.emergencyText = this.add.text(staticTextX, 663, "", { fontSize: '24px', fill: '#000' });
    this.emergencyText.setDepth(1);
    this.graphics.strokeRect(staticTextX - 5, 645, 260, 60);

    // big message in the center - need black font
    this.msgCenter = this.add.bitmapText(300, 282, 'bigFontB', "Scenario " + scenario, 64);

    this.cameras.main.backgroundColor.setTo(128, 128, 128);
    this.physics.add.collider(this.ferry, this.ships, this.hitShip, null, this);

    // current remaining time
    this.timeText = this.add.bitmapText(800, 16, 'bigFont', '5:00', 32);

    // reset camera effects
    this.cameras.main.resetFX();
  }

  update(time, delta) {
    // console.log(time, delta);
    this.timePassed += delta *  speedFactor;
    let timeElapsed = Math.floor(this.timePassed / 1000); // 1 sec interval
    let timeElapsed500 = Math.floor(this.timePassed / 500); // 0.5 sec interval
    this.timeVelocityChange -= delta * speedFactor;

    // display remained time
    this.setTime(timeElapsed);

    // remove scenario message at the beginning
    if (timeElapsed === 2) {
      this.msgCenter.setText("");
    }

    // process scenarios
    if (!this.scenarioActivated) {
      if (scenario === 5 && this.cross === 1 && this.ferry.y >= upY + 35 * 2) {
        this.scenarioActivated = true;

        this.time.delayedCall(250, function () {
          this.cameras.main.fadeOut(250);
        }, [], this);

        this.time.delayedCall(500, function () {
          this.cameras.main.fadeIn(250);
          this.ships.children.iterate(function (child) {
            if (child.y >= upY + 35 * 3 && child.kayak) {
              console.log(child.x, this.ferry.x);
              child.x = this.ferry.x; //  - ferry.displayHeight - child.displayWidth / 2;
              child.setVelocityX(0);
            }
          });
        }, [], this);

        this.time.delayedCall(15500, function () {
          this.ships.children.iterate(function (child) {
            if (child.y >= upY + 35 * 3 && child.kayak) {
              child.setVelocityX(child.shipSpeed * speedRatio);
            }
          });
        }, [], this);
      }
      else if (scenario === 3 && this.cross === 1 && this.ferry.y >= upY + 35 * 3) {
        this.scenarioActivated = true;
        this.emergency.setFrame(2);
        this.emergencyText.setText("Please Stop!!!!!");
        this.graphics.lineStyle(4, 0xFF0000, 1.0);
        this.graphics.strokeRect(staticTextX - 5, 645, 260, 60);
        this.timeScenarioActivated = this.timePassed;
        this.stopRequested = true;
      } else if (scenario === 2 && timeElapsed === 30) {
        this.scenarioActivated = true;
        this.ACSFailed = true;
        this.maintenanceNeeded = true;
        this.timeACSFailed = this.timePassed;
      }
    }

    if (!this.gameover && this.stopRequested && this.timePassed - this.cenarioActivated >= 10000) {
        this.gameOver(6, this);  // emergency stop requested...but,,, failed
    }

    if (!this.thrusterFailed && this.ACSFailed && this.timePassed - this.timeACSFailed >= 30000) {
      this.thrusterB.setFrame(2);
      this.thrusterFailed = true;
    }

    //console.log(gameover, maintenanceCalled, ACSFailed, timeElapsed - timeACSFailed);
    if (!this.gameover && !this.maintenanceCalled && this.ACSFailed && this.timePassed - this.timeACSFailed >= 40000) {
      this.gameOver(5, this);  // ACS FAiled and One Thruster failed and no maintenance called
    }

    // start the engine with strong wind
    if (this.falseStartWind && this.engineFailed < 3) {
      if (this.engineFailed === 0 && this.timePassed - this.timeFalseStart > 5000) { // after 5 seconds, first thruster fails(red)
        // engine failure
        this.thrusterA.setFrame(2);
        this.engineFailed = 1;
      } else if (this.engineFailed === 1 && this.timePassed - this.timeFalseStart > 15000) {
        this.thrusterB.setFrame(1);
        this.engineFailed = 2;
      } else if (this.engineFailed === 2 && this.timePassed - this.timeFalseStart > 20000) {
        this.thrusterB.setFrame(2);
        this.engineFailed = 3;
        this.timeEngineFailed = this.timePassed;
      }
    }

    // if engine failed, you cannot move at all
    if (this.engineFailed === 3) {
      this.setSpeed(0);

      if (!this.gameover && this.maintenanceCalled) {
        this.gameOver(8, this);
      }

      if (!this.gameover && this.timePassed - this.timeEngineFailed > 10000) {
        this.gameOver(7, this);
      }
    }

    // check time over
    if (timeElapsed >= 300 && !this.gameover) {
      this.gameOver(1, this);  // time out...
    }

    // adjust the ferry real speed with current set speed
    this.timeVelocityChange = this.ferry.adjustSpeed(this.timeVelocityChange, speedRatio);

    // maintenance called check
    if (this.atDock && this.maintenanceCalled && !this.gameover) {
      // check properly or not properly
      if (this.maintenanceNeeded) {
        this.score += this.ferry.load / 50;
        this.ferry.load = 0;
        this.gameOver(4, this);  // good job!!!
      } else
        this.gameOver(5, this); // no needed maintenance...(?)
    }

    // dock loading/unloading simulation
    if (this.atDock && timeElapsed500 != this.preTimeElapsed500) {
      this.preTimeElapsed500 = timeElapsed500;
      //console.log("Loading", this.loading, this.ferry.load, this.ferryDirection, this.peopleLower);

      if (this.loading == false) {
        if (this.ferry.load > 0) {
          this.ferry.load -= 50;
          this.score++;
        }

        if (this.ferry.load == 0) {
          this.loading = true;
          if (this.score === 40) {
            totalScore += this.score;
            this.gameOver(2, this);
          }
        }
      } else {
        if (this.ferry.ferryDirection === -1 && this.ferry.load < 600 && this.peopleLower > 0) {
          this.peopleLower--;
          this.peopleLowerText.setText(this.peopleLower);
          this.ferry.load += 50;
        }
        if (this.ferry.ferryDirection === 1 && this.ferry.load < 600 && this.peopleUpper > 0) {
          this.peopleUpper--;
          this.peopleUpperText.setText(this.peopleUpper);
          this.ferry.load += 50;
        }
      }

      this.loadText.setText(this.ferry.load / 50);

      if (featurePasengerText) {
        if (this.ferry.load >= 500) { // adjust location of text for two digits
          this.passengerText.x = this.ferry.x - 10;
        } else {
          this.passengerText.x = this.ferry.x - 5;
        }
        this.passengerText.setText(this.ferry.load / 50);
      }
    }
    // move the passenger text with ferry
    if (featurePasengerText && this.passengerText.y !== this.ferry.y - 4)
      this.passengerText.y = this.ferry.y - 4;

    // haloCircle
    var circle = new Phaser.Geom.Circle(this.ferry.x, this.ferry.y, haloRadius);
    var circle2 = new Phaser.Geom.Circle(this.ferry.x, this.ferry.y, stopRadius);
    var circleHorn = new Phaser.Geom.Circle(this.ferry.x, this.ferry.y, hornRadius);

    this.haloStatus = 0; // reset haloStatus
    this.ships.children.iterate(function (child) {
      var rectBounds = child.getBounds();
      sceneObj.haloCheck(circle, circle2, rectBounds, child);
      if (child.shipDirection === 1 && child.x > rightX * 5 / 4) {
        child.x = Phaser.Math.Between(-rightX / 4, -adjustX);
        if (!child.kayak) {
          var tmpScale = Phaser.Math.Between(20, 30) / 100;
          child.setScale(tmpScale);
          child.shipSpeed = Phaser.Math.Between(2, 5) * child.shipDirection;
          child.currentSpeed = child.shipSpeed;
        }
      } else if (child.shipDirection === -1 && child.x < -rightX / 4) {
        child.x = Phaser.Math.Between(adjustX + rightX, rightX * 5 / 4);
        if (!child.kayak) {
          var tmpScale = Phaser.Math.Between(20, 30) / 100;
          child.setScale(tmpScale);
          child.shipSpeed = Phaser.Math.Between(2, 5) * child.shipDirection;
          child.currentSpeed = child.shipSpeed;
        }
      }
      if (child.kayak) { // kayak has a chance of speed change
        child.timeChangeSpeed -= delta;
        if (child.timeChangeSpeed < 0 && Phaser.Math.Between(0, 1) === 1) { // 50% chance to change speed
          //console.log("kayak speed changed from ", child.shipSpeed);
          child.shipSpeed = Phaser.Math.Between(0, 3) * child.shipDirection;
          child.currentSpeed = child.shipSpeed;
          //console.log("to ", child.shipSpeed);
          child.timeChangeSpeed = Phaser.Math.Between(5000, 10000); // next delta should be between 5 and 10 seconds
        }
      }

      // speaker warning
      child.processTasks(child, circleHorn, rectBounds, delta, speedFactor, stopRadius, sceneObj.ferry, sceneObj.speakerWarning);

      // when speedRatio changed...this affects all the boats speed
      child.setVelocityX(child.shipSpeed * speedRatio);
    });

    this.graphicsBoundary.clear();
    if (this.haloStatus === 0)
      this.graphicsBoundary.lineStyle(1, 0x008000, 1);
    else if (this.haloStatus >= 1)
      this.graphicsBoundary.lineStyle(1, 0xe0e000, 1);

    if (this.ACSFailed) {
      this.graphicsBoundary.lineStyle(1, 0xc00000, 1);
      //setSpeed(0, this);
    }

    this.graphicsBoundary.strokeCircle(this.ferry.x, this.ferry.y, haloRadius);
    //graphicsBoundary.lineStyle(1, 0x008080, 1);
    //graphicsBoundary.strokeCircle(ferry.x, ferry.y, stopRadius);

    // speed control by keyboard
    if (this.cursors.up.isDown) {
      this.setSpeed((this.ferry.speed - 1 < -30) ? -30 : this.ferry.speed - 1, this);
    } else if (this.cursors.down.isDown) {
      this.setSpeed((this.ferry.speed + 1 > 30) ? 30 : this.ferry.speed + 1, this);
    }
  }

  // check halo radius and activate ACS if needed
  haloCheck(circle, circle2, rect, obj) {
    if (this.haloStatus == 0 && Phaser.Geom.Intersects.CircleToRectangle(circle, rect)) {
      this.haloStatus = 1;

      // for scenario 1 all ship doesn't yield
      if (scenario !==1 && obj.shipDirection * this.ferry.ferryDirection === -1 && obj.shipACS) {  // from left side of the this.ferry
        if ((this.ferry.ferryDirection === -1 && obj.y - obj.displayHeight / 2 < this.ferry.y + this.ferry.displayHeight / 2) ||   // this.ferry down to up
             (this.ferry.ferryDirection === 1 && obj.y + obj.displayHeight / 2 > this.ferry.y - this.ferry.displayHeight / 2) ) {  // this.ferry up to down
          // left to right
          if ((obj.shipDirection === 1 && obj.x + obj.displayWidth / 2 < this.ferry.x - stopRadius / 2 ) ||   // ship left to right
              (obj.shipDirection === -1 && obj.x - obj.displayWidth / 2 > this.ferry.x + stopRadius / 2 )) { // ship right to left
            obj.body.moves = false;
            obj.stoppedByACS = true;
          }
        }
      }
      //console.log(obj,  obj.body.moves);

      // ACS stop activated
      if (Phaser.Geom.Intersects.CircleToRectangle(circle2, rect)) {
        this.haloStatus = 2;
        this.setSpeed(0); // stop the ferry
      }
    }
    if (this.haloStatus === 0 && obj.stoppedByACS) {
      obj.body.moves = true;
      obj.stoppedByACS = false;
    }
  }

  // find the available space for ships to avoid collision by each other
  findAvailable(obj) {
    var i = Phaser.Math.Between(0, 8);

    var result = this.checkAvailableSpace(i, obj);

    if (result !== -1) return result * 35 + upY;

    for(var j=i; j<=i+10;j++) {
      var result = this.checkAvailableSpace(j % 9, obj);

      if (result !== -1) return result * 35 + upY;
    }
    return -1;
  }

  checkAvailableSpace(i, obj) {
    if (this.occupied[i] === null) {
      this.occupied[i] = obj;
      return i;
    }
    return -1;
  }

  freeOccupiedSpace(y) {
    this.occupied[(y-upY) / 35] = null;
  }

  // display the currently reamined time
  setTime(timeElasped) {
    this.timeLeft = 300 - timeElasped;
    var minutes = this.timeLeft % 60;
    var hour = (this.timeLeft - minutes) / 60;
    if (minutes == 0) {
      this.timeText.setText(hour + ":00");
    } else
      this.timeText.setText(hour + ":" + minutes);
  }

  startStopPushedDown(obj) {
    this.setSpeed((this.ferry.speed === 0) ? this.ferry.ferryDirection * this.ferry.ferryStartSpeed : 0, obj.startStop);
  }

  speedUpPushedDown(obj) {
    //console.log("Button Active", obj.speed, this.speed);
    this.setSpeed((Math.abs(this.ferry.speed) >= this.ferry.ferryMaxSpeed) ? this.ferry.ferryMaxSpeed * this.ferry.ferryDirection : this.ferry.speed + this.ferry.ferryDirection, obj);
  }

  speedDownPushedDown(obj) {
    //console.log("Button Active", obj.speed, this.speed);
    this.setSpeed((this.ferry.speed === 0) ? 0 : this.ferry.speed - this.ferry.ferryDirection, obj);
  }

  speakerButtonPushedDown(obj) {
    this.speakerWarning = true;
  }

  speakerButtonPushedUp(obj) {
    this.speakerWarning = false;
  }

  toolsButtonPushedDown(obj) {
    this.maintenanceCalled = true;
  }

  // Add static text which doesn't change at all
  addStaticText(x, y, msg, scene) {
    var variable = scene.add.bitmapText(x, y-6, 'bigFontB', msg, 24);
    variable.setDepth(1);
  }

  // hit other side dock
  hitPlatform(ferry) {
    //this.physics.pause();
    ferry.ferryDirection *= -1;
    ferry.ferrySpeed = 0; // immediately stop the ferry (one exception)
    this.setSpeed(0, this);

    this.atDock = true;
    if (this.ferry.load > 0) this.loading = false;

    this.cross++;
  }

  // when ferry is hit by ships
  hitShip(ferry, ship) {
    ferry.setTint(0xff0000);

    if (!this.gameover)
      this.gameOver(0, this);
  }

  // process game over
  gameOver(success, scene) {
    this.gameover = true;

    console.log("Game Over", this, scene);
    // shake the camera if collision or engine fails...
    var msg = "Game Over!!!";
    switch(success) {
      case 0:
        msg = "Crashed!!!!!";
        scene.cameras.main.shake(250);
        break;
      case 1:
        msg = "Time Over!!!";
        break;
      case 2:
        msg ="Good Job!!!!!";
        break;
  //    case 3:
  //      msg ="Good Job!!!!!";
  //      break;
      case 4:
        msg ="Out of Service!!!";
        break;
      case 5:
        msg ="Maintenance???";
        break;
      case 6:
        msg ="Stop Requested!!!";
        break;
      case 7:
        msg ="Engine Failed!!!";
        break;
      case 8:
        msg ="Too Windy!!!!!";
        break;
      case -1:
        msg = "To Scenario " + (scenario + 1);
        break;
    }

    scene.msgCenter.setText(msg);

    console.log(scenario++); // yeah global variable still remaining....
    totalScore += this.score;

    // restart game
    if (success === -1) {
      // fade camera
      scene.time.delayedCall(500, function () {
        scene.cameras.main.fade(500);
      }, [], scene);

      scene.time.delayedCall(1000, function () {
        scene.scene.restart();
      }, [], scene);
    } else  if (scenario < 5) {
      // fade camera
      scene.time.delayedCall(4500, function () {
        scene.cameras.main.fade(500);
      }, [], scene);

      scene.time.delayedCall(5000, function () {
        console.log("Restart", this, scene);
        scene.scene.restart();
      }, [], scene);

    } else {  // last scenario 4...
       console.log(scenario);
       scene.time.delayedCall(4000, function () {
         // reset camera effects
         scene.cameras.main.resetFX();
         this.msgCenter.setText("Game Over! Thank you!");
         this.msgCenter.x = 100;
      }, [], scene);
    }
  }

  // set the speed of the ferry
  setSpeed(speed, obj) {
    if (this.ferry.speed === 0 && speed !== 0) {
      this.atDock = false;
    }

    this.ferry.speed = speed;

    // change speed related UI
    this.speedText.setText(Math.abs(speed) + " kn");
    if (obj !== this.startStop)
      this.startStop.setFrame((speed === 0) ? 0 : 3);

    // process starting with strong wind
    if (speed !== 0 && this.windSpeed > 15 && !this.falseStartWind) {
      this.falseStartWind = true;
      this.timeFalseStart = this.timePassed;
      console.log("Start with Strong Wind...");
    }

    // if emergency stop requested
    if (speed === 0 && this.stopRequested) {
      this.stopRequested = false;
      this.emergency.setFrame(0);
      this.emergencyText.setText("Thank you!!!!!");
      this.graphics.lineStyle(4, 0x000000, 1.0);
      this.graphics.strokeRect(staticTextX - 5, 645, 260, 60);
    }
  }
}
