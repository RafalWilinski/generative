const canvasSketch = require("canvas-sketch");
const { renderPaths, pathsToPolylines } = require("canvas-sketch-util/penplot");
const { clipPolylinesToBox } = require("canvas-sketch-util/geometry");
const Random = require("canvas-sketch-util/random");
import { GUI } from "dat.gui";

Random.setSeed(Random.getRandomSeed());

const params = {
  lineWidth: 0.01
};

const settings = {
  suffix: Random.getSeed(),
  dimensions: "A4",
  orientation: "portrait",
  pixelsPerInch: 300,
  scaleToView: true,
  units: "cm",
  params,
  fps: 1
};

const sketch = props => {
  const { width, height, units, settings } = props;
  const margin = 1;
  const box = [margin, margin, width - margin, height - margin];

  return props => {
    const { lineWidth } = settings.params;
    const paths = [];

    let lines = pathsToPolylines(paths, { units });
    lines = clipPolylinesToBox(lines, box);

    return renderPaths(lines, {
      ...props,
      lineJoin: "round",
      lineCap: "round",
      lineWidth,
      optimize: true
    });
  };
};

(async () => {
  const manager = await canvasSketch(sketch, settings);
  const gui = new GUI();

  add(gui, params, "lineWidth", 0.001, 0.05);
  gui.remember(params);

  function add(gui, ...args) {
    return gui.add(...args).onChange(render);
  }

  function render() {
    manager.render();
  }

  var update = function() {
    requestAnimationFrame(update);

    if (params.animate) {
      params.phase =
        Math.abs(Math.cos(+new Date() / 100000)) * params.animationSpeed;

      // Iterate over all controllers
      for (var i in _gui.__controllers) {
        _gui.__controllers[i].updateDisplay();
        manager.render();
      }
    }
  };

  update();
})();
