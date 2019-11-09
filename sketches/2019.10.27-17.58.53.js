const canvasSketch = require('canvas-sketch');
const { renderPaths, createPath, pathsToPolylines } = require('canvas-sketch-util/penplot');
const { clipPolylinesToBox } = require('canvas-sketch-util/geometry');
const Random = require('canvas-sketch-util/random');
const defaultSeed = '';
Random.setSeed(defaultSeed || Random.getRandomSeed());

const settings = {
  suffix: Random.getSeed(),
  dimensions: 'A4',
  orientation: 'portrait',
  pixelsPerInch: 300,
  scaleToView: true,
  units: 'cm',
};

const sketch = (props) => {
  Random.setSeed(Random.getRandomSeed());
  const { width, height, units } = props;
  const paths = [];
  const x = 20;
  const y = 88;
  const count = y * x;
  for (let i = 0; i < count; i++) {
    const p = createPath();
    p.moveTo(
      Math.floor(i / y),
      Math.floor(i % y),
      1,
      Random.noise1D(i, 1000, 50),
      Random.noise1D(i, 1000, 50),
    );
    let j = i - y * Math.random() * 100;
    p.lineTo(Math.floor(j / y), Math.floor(j % y));

    paths.push(p);
  }

  let lines = pathsToPolylines(paths, { units });

  const margin = 1; // in working 'units' based on settings
  const box = [margin, margin, width - margin, height - margin];
  lines = clipPolylinesToBox(lines, box);

  return (props) =>
    renderPaths(lines, {
      ...props,
      lineJoin: 'round',
      lineCap: 'round',
      lineWidth: 0.03,
      optimize: false,
    });
};

canvasSketch(sketch, settings);
