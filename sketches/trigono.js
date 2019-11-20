const canvasSketch = require("canvas-sketch");
const { renderPaths, pathsToPolylines } = require("canvas-sketch-util/penplot");
const { clipPolylinesToBox } = require("canvas-sketch-util/geometry");
const Random = require("canvas-sketch-util/random");
import { GUI } from "dat.gui";

Random.setSeed(Random.getRandomSeed());

const params = {
  baseSize: 1.045571549534293,
  increment: 0.1,
  angularChange: 2.1081287044877226,
  count: 90.14902624894158,
  lineWidth: 0.018956985605419138,
  animate: false,
  animationSpeed: 5
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

const drawSquare = (
  i,
  paths,
  { baseSize, increment, angularChange },
  baseX,
  baseY
) => {
  const sideLength = baseSize + i * increment;
  const angle = i * angularChange;

  const line = [
    Math.sin(angle) * sideLength + baseX,
    Math.cos(angle) * sideLength + baseY
  ];

  paths.push(line);
};

const sketch = props => {
  const { width, height, units, settings } = props;
  const margin = 1;
  const box = [margin, margin, width - margin, height - margin];

  return props => {
    const paths = [];

    for (let i = 0; i < settings.params.count; i++) {
      drawSquare(i, paths, settings.params, width / 2, height / 2);
    }

    let lines = pathsToPolylines(paths, { units });
    lines = clipPolylinesToBox(lines, box);

    return renderPaths(lines, {
      ...props,
      lineJoin: "round",
      lineCap: "round",
      lineWidth: settings.params.lineWidth,
      optimize: true
    });
  };
};

let _gui;

(async () => {
  const manager = await canvasSketch(sketch, settings);
  const gui = new GUI();
  _gui = gui;

  add(gui, params, "baseSize", 0.1, 10);
  add(gui, params, "increment", 0.01, 1);
  add(gui, params, "angularChange", 0.01, 15);
  add(gui, params, "count", 1, 2500);
  add(gui, params, "lineWidth", 0.001, 0.05);
  add(gui, params, "animate");
  add(gui, params, "animationSpeed", 0.1, 25);

  gui.remember(params);

  function add(gui, ...args) {
    return gui.add(...args).onChange(render);
  }

  function render() {
    manager.render();
  }

  var update = function() {
    console.log("update");
    requestAnimationFrame(update);
    if (params.animate) {
      params.angularChange =
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
