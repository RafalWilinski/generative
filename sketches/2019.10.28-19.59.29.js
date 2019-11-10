const canvasSketch = require('canvas-sketch');
const { renderPaths, pathsToPolylines } = require('canvas-sketch-util/penplot');
const { clipPolylinesToBox } = require('canvas-sketch-util/geometry');
const Random = require('canvas-sketch-util/random');
import { GUI } from 'dat.gui';

Random.setSeed(Random.getRandomSeed());

const params = {
  jDiv: 4.086875529212532,
  linesCount: 200,
  points: 100,
  sinDiv: 4.5888738357324295,
  sinValDiv: 1.3646232006773922,
  iDiv: 6.3154953429297205,
};

const settings = {
  suffix: Random.getSeed(),
  dimensions: 'A4',
  orientation: 'portrait',
  pixelsPerInch: 300,
  scaleToView: true,
  units: 'cm',
  params,
  fps: 1,
};

const sketch = (props) => {
  const { width, height, units, settings } = props;
  const margin = 1;
  const box = [margin, margin, width - margin, height - margin];

  return (props) => {
    const { iDiv, jDiv, sinDiv, sinValDiv, linesCount, points } = settings.params;
    const paths = [];

    for (let i = 0; i < linesCount; i++) {
      const line = [];
      for (let j = 0; j < points; j++) {
        line.push([j / jDiv, i / iDiv + Math.sin(j / sinDiv + i / sinDiv) / sinValDiv]);
      }
      paths.push(line);
    }

    let lines = pathsToPolylines(paths, { units });
    lines = clipPolylinesToBox(lines, box);

    return renderPaths(lines, {
      ...props,
      lineJoin: 'round',
      lineCap: 'round',
      lineWidth: 0.01,
      optimize: true,
    });
  };
};

(async () => {
  const manager = await canvasSketch(sketch, settings);
  const gui = new GUI();

  add(gui, params, 'jDiv', 1, 50);
  add(gui, params, 'linesCount', 1, 500);
  add(gui, params, 'points', 1, 500);
  add(gui, params, 'sinDiv', 0.1, 20);
  add(gui, params, 'sinValDiv', 0.1, 5);
  add(gui, params, 'iDiv', 1, 20);
  gui.remember(params);

  function add(gui, ...args) {
    return gui.add(...args).onChange(render);
  }

  function render() {
    manager.render();
  }
})();
