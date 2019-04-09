import Phaser from "phaser";
import { GameScene } from "./scenes/game";

const config = {
  type: Phaser.AUTO,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  },
  width: 1280,
  height: 720,
//        scale: {
//          mode: Phaser.Structs.Size.FIT,
//          width: 1280,
//          height: 720
//        },
//        width: window.innerWidth * window.devicePixelRatio,
//        height: window.innerHeight * window.devicePixelRatio,
  scene: GameScene
};

var game = new Phaser.Game(config);



