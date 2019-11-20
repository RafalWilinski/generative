const canvasSketch = require("canvas-sketch");
const { renderPaths, pathsToPolylines } = require("canvas-sketch-util/penplot");
const { clipPolylinesToBox } = require("canvas-sketch-util/geometry");
const Random = require("canvas-sketch-util/random");
import { GUI } from "dat.gui";
const mat4 = require("gl-mat4");
const vec3 = require("gl-vec3");
const project = require("camera-project");

Random.setSeed(Random.getRandomSeed());

const params = {
  lineWidth: 0.02,
  boxSize: 0.3,
  spacing: 0.5,
  cameraPosX: 7.2,
  cameraPosY: 13,
  cameraPosZ: -26.799322607959354,
  boxLines: 35,
  boxesPerLine: 50,
  noiseSize: 0.16764318374259105,
  amplitude: 1
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
    const {
      lineWidth,
      cameraPosX,
      cameraPosY,
      cameraPosZ,
      boxSize,
      boxLines,
      boxesPerLine,
      spacing,
      noiseSize,
      amplitude
    } = settings.params;
    const paths = [];

    var projection = mat4.create();
    var view = mat4.create();
    var position = [cameraPosX, cameraPosY, cameraPosZ];
    var direction = [0, 0, -1];
    var up = [0, 1, 0];
    var center = [0, 0, 0];
    var viewport = [0, 0, width, height];

    mat4.perspective(
      projection,
      Math.PI / 4,
      viewport[2] / viewport[3],
      0.01,
      100
    );

    vec3.add(center, position, direction);
    mat4.lookAt(view, position, center, up);

    var combinedProjView = mat4.multiply([], projection, view);

    const drawBox = (x, y) => {
      var points = [
        [0, 0, 0],
        [boxSize, 0, 0],
        [boxSize, boxSize, 0],
        [0, boxSize, 0],
        [0, 0, 0],
        [0, 0, boxSize],
        [0, boxSize, boxSize],
        [0, boxSize, 0],
        [0, boxSize, boxSize],
        [boxSize, boxSize, boxSize],
        [boxSize, boxSize, 0],
        [boxSize, boxSize, boxSize],
        [boxSize, 0, boxSize],
        [0, 0, boxSize],
        [boxSize, 0, boxSize],
        [boxSize, 0, 0]
      ];

      var output = [];
      const box = [];

      points.forEach(point => {
        point[0] += x * spacing;
        point[1] += y * spacing;
        point[2] += Random.noise2D(
          x * spacing,
          y * spacing,
          noiseSize,
          amplitude
        );

        const a = project(output, point, viewport, combinedProjView);
        box.push([a[0], a[1]]);
      });

      return box;
    };

    for (let i = 0; i < boxLines; i++) {
      for (let j = 0; j < boxesPerLine; j++) {
        paths.push(drawBox(i, j));
      }
    }

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
  add(gui, params, "boxSize", 0.001, 5);
  add(gui, params, "spacing", 0.01, 2);
  add(gui, params, "cameraPosX", -20, 20);
  add(gui, params, "cameraPosY", -20, 20);
  add(gui, params, "cameraPosZ", -50, 0);
  add(gui, params, "boxLines", 5, 100);
  add(gui, params, "boxesPerLine", 5, 100);
  add(gui, params, "noiseSize", 0.001, 0.5);
  add(gui, params, "amplitude", 0.01, 5);
  gui.remember(params);

  function add(gui, ...args) {
    return gui.add(...args).onChange(render);
  }

  function render() {
    manager.render();
  }
})();
