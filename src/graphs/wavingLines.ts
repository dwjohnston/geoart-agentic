import type { GeoArtGraph } from '../schema/_generated/schema-types';

// Waving Lines algorithm.
//
// Four orbits sit in the four quadrants of the canvas.
// A row of evenly-spaced colour points is stretched between the
// top-left and top-right orbits, and another between the bottom-left
// and bottom-right orbits. A correspondingLines render node then
// connects each top point to its matching bottom point, producing a
// curtain of lines that waves as the orbits move.

export const wavingLinesGraph: GeoArtGraph = {
  version: '2.0',
  control: {
    nodes: [
      // --- Orbit speeds ---
      {
        id: 'tlSpeedSlider',
        type: 'slider',
        params: {
          label: { v: 'Top-Left Speed' },
          min: { v: -5 }, max: { v: 5 }, value: { v: 0.3 }, step: { v: 0.01 },
        },
      },
      {
        id: 'trSpeedSlider',
        type: 'slider',
        params: {
          label: { v: 'Top-Right Speed' },
          min: { v: -5 }, max: { v: 5 }, value: { v: 0.5 }, step: { v: 0.01 },
        },
      },
      {
        id: 'blSpeedSlider',
        type: 'slider',
        params: {
          label: { v: 'Bottom-Left Speed' },
          min: { v: -5 }, max: { v: 5 }, value: { v: 0.7 }, step: { v: 0.01 },
        },
      },
      {
        id: 'brSpeedSlider',
        type: 'slider',
        params: {
          label: { v: 'Bottom-Right Speed' },
          min: { v: -5 }, max: { v: 5 }, value: { v: 0.4 }, step: { v: 0.01 },
        },
      },
      // --- Orbit radii ---
      {
        id: 'tlRadiusSlider',
        type: 'slider',
        params: {
          label: { v: 'Top-Left Radius' },
          min: { v: 0 }, max: { v: 0.4 }, value: { v: 0.18 }, step: { v: 0.01 },
        },
      },
      {
        id: 'trRadiusSlider',
        type: 'slider',
        params: {
          label: { v: 'Top-Right Radius' },
          min: { v: 0 }, max: { v: 0.4 }, value: { v: 0.18 }, step: { v: 0.01 },
        },
      },
      {
        id: 'blRadiusSlider',
        type: 'slider',
        params: {
          label: { v: 'Bottom-Left Radius' },
          min: { v: 0 }, max: { v: 0.4 }, value: { v: 0.18 }, step: { v: 0.01 },
        },
      },
      {
        id: 'brRadiusSlider',
        type: 'slider',
        params: {
          label: { v: 'Bottom-Right Radius' },
          min: { v: 0 }, max: { v: 0.4 }, value: { v: 0.18 }, step: { v: 0.01 },
        },
      },
      // --- Number of points ---
      {
        id: 'numPointsSlider',
        type: 'slider',
        params: {
          label: { v: 'Number of Lines' },
          min: { v: 1 }, max: { v: 20 }, value: { v: 8 }, step: { v: 1 },
        },
      },
      // --- Link rate ---
      {
        id: 'linkRate',
        type: 'slider',
        params: {
          label: { v: 'Link Rate' },
          min: { v: 1 },
          max: { v: 120 },
          step: { v: 1 },
          value: { v: 30 },
        },
      },
      // --- Colours ---
      {
        id: 'leftColor',
        type: 'colorPicker',
        params: {
          label: { v: 'Left Colour' },
          value: { v: { r: 0.2, g: 0.6, b: 1, a: 0.7 } },
        },
      },
      {
        id: 'rightColor',
        type: 'colorPicker',
        params: {
          label: { v: 'Right Colour' },
          value: { v: { r: 1, g: 0.3, b: 0.7, a: 0.7 } },
        },
      },
    ],
  },
  compute: {
    nodes: [
      { id: 'time', type: 'time', params: {} },
      // --- Four orbits, one per quadrant ---
      {
        id: 'tlOrbit',
        type: 'orbit',
        params: {
          time: { ref: 'time.time' },
          speed: { ref: 'tlSpeedSlider.value' },
          radius: { ref: 'tlRadiusSlider.value' },
          center: { v: { x: -0.5, y: 0.5 } },
        },
      },
      {
        id: 'trOrbit',
        type: 'orbit',
        params: {
          time: { ref: 'time.time' },
          speed: { ref: 'trSpeedSlider.value' },
          radius: { ref: 'trRadiusSlider.value' },
          center: { v: { x: 0.5, y: 0.5 } },
        },
      },
      {
        id: 'blOrbit',
        type: 'orbit',
        params: {
          time: { ref: 'time.time' },
          speed: { ref: 'blSpeedSlider.value' },
          radius: { ref: 'blRadiusSlider.value' },
          center: { v: { x: -0.5, y: -0.5 } },
        },
      },
      {
        id: 'brOrbit',
        type: 'orbit',
        params: {
          time: { ref: 'time.time' },
          speed: { ref: 'brSpeedSlider.value' },
          radius: { ref: 'brRadiusSlider.value' },
          center: { v: { x: 0.5, y: -0.5 } },
        },
      },
      // --- Pack orbit positions with colours ---
      {
        id: 'cpTopLeft',
        type: 'colorPointCompute',
        params: {
          point: { ref: 'tlOrbit.point' },
          color: { ref: 'leftColor.value' },
        },
      },
      {
        id: 'cpTopRight',
        type: 'colorPointCompute',
        params: {
          point: { ref: 'trOrbit.point' },
          color: { ref: 'rightColor.value' },
        },
      },
      {
        id: 'cpBottomLeft',
        type: 'colorPointCompute',
        params: {
          point: { ref: 'blOrbit.point' },
          color: { ref: 'leftColor.value' },
        },
      },
      {
        id: 'cpBottomRight',
        type: 'colorPointCompute',
        params: {
          point: { ref: 'brOrbit.point' },
          color: { ref: 'rightColor.value' },
        },
      },
      // --- Rows of evenly-spaced points ---
      {
        id: 'topLine',
        type: 'pointsOnALine',
        params: {
          pointA: { ref: 'cpTopLeft.colorPoint' },
          pointB: { ref: 'cpTopRight.colorPoint' },
          numberOfPoints: { ref: 'numPointsSlider.value' },
        },
      },
      {
        id: 'bottomLine',
        type: 'pointsOnALine',
        params: {
          pointA: { ref: 'cpBottomLeft.colorPoint' },
          pointB: { ref: 'cpBottomRight.colorPoint' },
          numberOfPoints: { ref: 'numPointsSlider.value' },
        },
      },
    ],
  },
  render: {
    nodes: [
      // --- Waving curtain of lines ---
      {
        id: 'curtain',
        type: 'timedLineArray',
        renderConfig: { layer: 'paint' },
        params: {
          intervalTicks: { ref: 'linkRate.value' },
          colorPointsA: { ref: 'topLine.points' },
          colorPointsB: { ref: 'bottomLine.points' },
        },
      },
      {
        id: 'lineDrawTop',
        type: 'timedLine',
        renderConfig: { layer: 'live' },
        params: {
          colorPointA: { ref: 'cpTopLeft.colorPoint' },
          colorPointB: { ref: 'cpTopRight.colorPoint' },
        },
      },
      {
        id: 'lineDrawBottom',
        type: 'timedLine',
        renderConfig: { layer: 'live' },
        params: {
          colorPointA: { ref: 'cpBottomLeft.colorPoint' },
          colorPointB: { ref: 'cpBottomRight.colorPoint' },
        },
      },
      // --- Live orbit indicators ---
      {
        id: 'dotTL',
        type: 'circle',
        renderConfig: { layer: 'live' },
        params: {
          center: { ref: 'tlOrbit.point' },
          radius: { v: 0.015 },
          color: { ref: 'leftColor.value' },
        },
      },
      {
        id: 'dotTR',
        type: 'circle',
        renderConfig: { layer: 'live' },
        params: {
          center: { ref: 'trOrbit.point' },
          radius: { v: 0.015 },
          color: { ref: 'rightColor.value' },
        },
      },
      {
        id: 'dotBL',
        type: 'circle',
        renderConfig: { layer: 'live' },
        params: {
          center: { ref: 'blOrbit.point' },
          radius: { v: 0.015 },
          color: { ref: 'leftColor.value' },
        },
      },
      {
        id: 'dotBR',
        type: 'circle',
        renderConfig: { layer: 'live' },
        params: {
          center: { ref: 'brOrbit.point' },
          radius: { v: 0.015 },
          color: { ref: 'rightColor.value' },
        },
      },
    ],
  },
};
