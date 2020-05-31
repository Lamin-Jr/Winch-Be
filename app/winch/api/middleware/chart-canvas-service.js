const { CanvasRenderService } = require('chartjs-node-canvas');

// Re-use one service, or as many as you need for different canvas size requirements
const smallCanvasRenderService = new CanvasRenderService(800, 450);
const bigCanvasRenderService = new CanvasRenderService(1920, 1080);

// Expose just the CanvasRenderService instances to downstream code so they don't have to worry about life-cycle management.
module.exports = {
  smallCanvasRenderService,
  bigCanvasRenderService,
};
