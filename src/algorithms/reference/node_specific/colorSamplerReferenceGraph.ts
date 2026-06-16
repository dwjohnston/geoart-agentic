import { AlgorithmBuilder } from '../../../schema/builder';

const graph = new AlgorithmBuilder({
  title: 'Colour Sampler Demo',
  author: 'Claude Sonnet 4.6',
  description:
    'Orbit ring coloured by a colorSampler — red channel pulses with a wave; G, B, A are slider-controlled via valueSampler nodes',
})
  .addControlNode({
    id: 'greenSlider',
    type: 'slider',
    params: {
      label: { v: 'Green' },
      min: { v: 0 },
      max: { v: 1 },
      step: { v: 0.01 },
      value: { v: 0.0 },
    },
  })
  .addControlNode({
    id: 'blueSlider',
    type: 'slider',
    params: {
      label: { v: 'Blue' },
      min: { v: 0 },
      max: { v: 1 },
      step: { v: 0.01 },
      value: { v: 0.0 },
    },
  })
  .addControlNode({
    id: 'alphaSlider',
    type: 'slider',
    params: {
      label: { v: 'Alpha' },
      min: { v: 0 },
      max: { v: 1 },
      step: { v: 0.01 },
      value: { v: 1.0 },
    },
  })
  .addControlNode({
    id: 'colorSamplerMode',
    type: 'colorSamplerModeSelector',
    params: {
      label: { v: 'Mode' },
      mode: { v: 'clobber' },
    },
  })
  .addComputeNode({ id: 'time', type: 'time', params: {} })
  .addComputeNode({
    id: 'redWave',
    type: 'wave',
    params: {
      time: { ref: 'time.time' },
      waveType: { v: 'sine' },
      frequency: { v: 1 },
      amplitude: { v: 0.5 },
    },
  })
  .addComputeNode({
    id: 'greenSampler',
    type: 'valueSampler',
    params: {
      value: { ref: 'greenSlider.value' },
    },
  })
  .addComputeNode({
    id: 'blueSampler',
    type: 'valueSampler',
    params: {
      value: { ref: 'blueSlider.value' },
    },
  })
  .addComputeNode({
    id: 'alphaSampler',
    type: 'valueSampler',
    params: {
      value: { ref: 'alphaSlider.value' },
    },
  })
  .addComputeNode({
    id: 'sampler',
    type: 'colorSampler',
    params: {
      sampleR: { ref: 'redWave.sampler' },
      sampleG: { ref: 'greenSampler.sampler' },
      sampleB: { ref: 'blueSampler.sampler' },
      sampleA: { ref: 'alphaSampler.sampler' },
      mode: { ref: 'colorSamplerMode.mode' },
    },
  })
  .addComputeNode({
    id: 'orbit',
    type: 'orbit',
    params: {
      time: { ref: 'time.time' },
      radius: { v: 0.5 },
      speed: { v: 0.15 },
      numPoints: { v: 64 },
      colorSampler: { ref: 'sampler.colorSampler' },
    },
  })
  .addRenderNode({
    id: 'ring',
    type: 'circle',
    renderConfig: { layer: 'live' },
    params: {
      centerPoints: { ref: 'orbit.points' },
      radius: { v: 0.01 },
    },
  })
  .construct();

export default graph;
