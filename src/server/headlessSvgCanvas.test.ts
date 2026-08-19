import { describe, expect, test } from 'bun:test';
import { createHeadlessSvgCanvas } from './headlessSvgCanvas';

describe('createHeadlessSvgCanvas', () => {
  test('emits a path element for a stroked line', () => {
    const canvas = createHeadlessSvgCanvas();
    canvas.strokeStyle = 'rgba(255, 0, 0, 0.5)';
    canvas.lineWidth = 3;
    canvas.beginPath();
    canvas.moveTo(1, 2);
    canvas.lineTo(3, 4);
    canvas.stroke();

    const [el] = canvas.getSvgElements();
    expect(el).toContain('<path');
    expect(el).toContain('M 1 2 L 3 4');
    expect(el).toContain('stroke="rgb(255, 0, 0)"');
    expect(el).toContain('stroke-opacity="0.5"');
    expect(el).toContain('stroke-width="3"');
    expect(el).toContain('fill="none"');
  });

  test('emits an ellipse element for a stroked single-ellipse path', () => {
    const canvas = createHeadlessSvgCanvas();
    canvas.strokeStyle = 'rgba(0, 255, 0, 1)';
    canvas.beginPath();
    canvas.ellipse(10, 20, 5, 3, Math.PI / 2, 0, Math.PI * 2);
    canvas.stroke();

    const [el] = canvas.getSvgElements();
    expect(el).toContain('<ellipse');
    expect(el).toContain('cx="10" cy="20" rx="5" ry="3"');
    expect(el).toContain('transform="rotate(90 10 20)"');
  });

  test('emits a filled path with fill-only attributes', () => {
    const canvas = createHeadlessSvgCanvas();
    canvas.fillStyle = 'rgba(1, 2, 3, 1)';
    canvas.beginPath();
    canvas.moveTo(0, 0);
    canvas.lineTo(1, 0);
    canvas.lineTo(1, 1);
    canvas.closePath();
    canvas.fill();

    const [el] = canvas.getSvgElements();
    expect(el).toContain('<path');
    expect(el).toContain('M 0 0 L 1 0 L 1 1 Z');
    expect(el).toContain('fill="rgb(1, 2, 3)"');
    expect(el).toContain('stroke="none"');
  });

  test('emits a gradient def and references it via url(#id)', () => {
    const canvas = createHeadlessSvgCanvas();
    const gradient = canvas.createLinearGradient(0, 0, 10, 10);
    gradient.addColorStop(0, 'rgba(255, 0, 0, 1)');
    gradient.addColorStop(1, 'rgba(0, 0, 255, 1)');
    canvas.strokeStyle = gradient;
    canvas.beginPath();
    canvas.moveTo(0, 0);
    canvas.lineTo(10, 10);
    canvas.stroke();

    const elements = canvas.getSvgElements();
    expect(elements.some(e => e.includes('<linearGradient'))).toBe(true);
    expect(elements.some(e => e.includes('url(#g'))).toBe(true);
  });

  test('clearRect empties all accumulated elements', () => {
    const canvas = createHeadlessSvgCanvas();
    canvas.beginPath();
    canvas.moveTo(0, 0);
    canvas.lineTo(1, 1);
    canvas.stroke();
    expect(canvas.getSvgElements().length).toBeGreaterThan(0);

    canvas.clearRect(0, 0, 1, 1);
    expect(canvas.getSvgElements()).toEqual([]);
  });

  test('an empty path produces no element on stroke/fill', () => {
    const canvas = createHeadlessSvgCanvas();
    canvas.beginPath();
    canvas.stroke();
    canvas.fill();
    expect(canvas.getSvgElements()).toEqual([]);
  });
});
