const canvasSketch = require("canvas-sketch");
const { renderPaths, pathsToPolylines } = require("canvas-sketch-util/penplot");
const { clipPolylinesToBox } = require("canvas-sketch-util/geometry");
const Random = require("canvas-sketch-util/random");
import { GUI } from "dat.gui";

Random.setSeed(Random.getRandomSeed());

const params = {
  noiseSize_1: 0.16764318374259105,
  amplitude_1: 1,
  noiseSize_2: 0.16764318374259105,
  amplitude_2: 1,
  noiseSize_3: 0.16764318374259105,
  amplitude_3: 1,
  linesCount: 162.23488569009317,
  pointsCount: 43.25232853513971,
  lineSpacing: 0.2,
  pointsSpacing: 0.48660626587637595,
  lineWidth: 0.018956985605419138,
  animate: false,
  animationSpeed: 50,
  phase: 0,
  startX: 5,
  startY: 5
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

const drawLine = (
  x,
  paths,
  {
    noiseSize_1,
    noiseSize_2,
    noiseSize_3,
    pointsCount,
    pointsSpacing,
    lineSpacing,
    phase,
    startX,
    startY,
    amplitude_1,
    amplitude_2,
    amplitude_3
  }
) => {
  const line = [];

  for (let i = 0; i < pointsCount; i++) {
    line.push([
      startX + i * pointsSpacing,
      startY +
        x * lineSpacing +
        Random.noise2D(
          i * pointsSpacing,
          x * lineSpacing + phase,
          noiseSize_1,
          amplitude_1
        ) +
        Random.noise2D(
          i * pointsSpacing,
          x * lineSpacing + phase,
          noiseSize_2,
          amplitude_2
        ) +
        Random.noise2D(
          i * pointsSpacing,
          x * lineSpacing + phase,
          noiseSize_3,
          amplitude_3
        )
    ]);
  }

  paths.push(line);
};

const sketch = props => {
  const { width, height, units, settings } = props;
  const margin = 1;
  const box = [margin, margin, width - margin, height - margin];

  return props => {
    const paths = [];

    for (let i = 0; i < settings.params.linesCount; i++) {
      drawLine(i, paths, settings.params);
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

  add(gui, params, "noiseSize_1", 0.001, 0.5);
  add(gui, params, "amplitude_1", 0.01, 5);

  add(gui, params, "noiseSize_2", 0.001, 0.5);
  add(gui, params, "amplitude_2", 0.01, 5);

  add(gui, params, "noiseSize_3", 0.001, 0.5);
  add(gui, params, "amplitude_3", 0.01, 5);

  add(gui, params, "linesCount", 1, 500);
  add(gui, params, "pointsCount", 1, 500);
  add(gui, params, "lineSpacing", 0.001, 1);
  add(gui, params, "pointsSpacing", 0.001, 1);
  add(gui, params, "lineWidth", 0.001, 0.05);
  add(gui, params, "animate");
  add(gui, params, "animationSpeed", 1, 500);
  add(gui, params, "phase", 0.0, 25);

  add(gui, params, "startX", 0, 10);
  add(gui, params, "startY", 0.0, 10);

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
