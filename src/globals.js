/* globals.js */
export default {
  meterPerPixel : 90 / 465, // Canal Length 90m / 465 pixel
  knToMPS : 0.514, // 2.6556 ~~~ 8/3
  // actual speed in current resolution (720)
  speedRatioOriginal : knToMPS / meterPerPixel, // 2.6556 ~~~~ 8/3
  speedFactor : 1,
  speedRatio : speedRatioOriginal * speedFactor, // 2.6556 ~~~~ 8/3 // for debugging
  haloRadius : Math.floor(10 / meterPerPixel), // 4 + 5 = 9m
  stopRadius : Math.floor(6.5 / meterPerPixel), // 4 + 1.5 = 5.5m
  hornRadius : Math.floor(20 / meterPerPixel),
  scaleRatio : 1,
  // to dynamically resize each image size we need to use scaleRatio using follows
  //var scaleRatio = window.devicePixelRatio;
  //console.log("Scale Ratio: " + scaleRatio + " Width: " + config.width + " Height: " + config.height);

};
