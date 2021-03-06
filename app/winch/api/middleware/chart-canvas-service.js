const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

// Re-use one service, or as many as you need for different canvas size requirements
// const smallCanvasRenderService = new CanvasRenderService(800, 450);
const smallCanvasRenderService = new ChartJSNodeCanvas({ width: 640, height: 360 }); // ((704, 440); // (720, 450); // (720, 405); //(768, 432); // (784, 441);
const bigCanvasRenderService = new ChartJSNodeCanvas({ width: 1920, height: 1080 });

// Expose just the CanvasRenderService instances to downstream code so they don't have to worry about life-cycle management.
module.exports = {
  smallCanvasRenderService,
  bigCanvasRenderService,
};
