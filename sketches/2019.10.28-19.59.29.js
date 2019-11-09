const canvasSketch = require('canvas-sketch');
const { renderPaths, createPath, pathsToPolylines } = require('canvas-sketch-util/penplot');
const { clipPolylinesToBox } = require('canvas-sketch-util/geometry');
const Random = require('canvas-sketch-util/random');
import * as dat from 'dat.gui';

const gui = new dat.GUI();

Random.setSeed(Random.getRandomSeed());

console.log('Random Seed:', Random.getSeed());

const settings = {
  suffix: Random.getSeed(),
  dimensions: 'A4',
  orientation: 'portrait',
  pixelsPerInch: 300,
  scaleToView: true,
  units: 'cm',
  params: {
    jDiv: 25,
    i: 10,
    j: 250,
    sinDiv: 10,
    sinValDiv: 10,
    iDiv: 4,
  },
  animate: true,
  duration: 3,
  fps: 1,
};

gui.add(settings.params, 'jDiv', 1, 50);
gui.add(settings.params, 'i', 1, 500);
gui.add(settings.params, 'j', 1, 500);
gui.add(settings.params, 'sinDiv', 0.1, 20);
gui.add(settings.params, 'sinValDiv', 0.1, 5);
gui.add(settings.params, 'iDiv', 1, 20);
gui.remember(settings.params);

const sketch = (props) => {
  const { width, height, units, settings } = props;
  const margin = 1; // in working 'units' based on settings
  const box = [margin, margin, width - margin, height - margin];

  console.log(props);

  return (props) => {
    console.log('return!');

    const { jDiv } = settings.params;
    const paths = [];

    for (let i = 0; i < settings.params.i; i++) {
      const line = [];
      for (let j = 0; j < settings.params.j; j++) {
        line.push([
          j / jDiv,
          i / settings.params.iDiv +
            Math.sin(j / settings.params.sinDiv + i / settings.params.sinDiv) /
              settings.params.sinValDiv,
        ]);
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

const s = canvasSketch(sketch, settings);
s.then(console.log);
