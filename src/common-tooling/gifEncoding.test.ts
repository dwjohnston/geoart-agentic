import { describe, expect, test } from 'bun:test';
import { encodeGif } from './gifEncoding';
import type { RgbaFrame } from './gifEncoding';

function solidFrame(width: number, height: number, rgba: [number, number, number, number]): RgbaFrame {
  const pixels = new Uint8Array(width * height * 4);
  for (let i = 0; i < width * height; i++) pixels.set(rgba, i * 4);
  return { pixels, width, height };
}

/** Counts GIF image descriptors (0x2C separator followed by a 9-byte descriptor). */
function countImageDescriptors(gif: Uint8Array): number {
  // Walk the block structure rather than scanning for 0x2C bytes, which could
  // appear inside pixel data. Header (6) + LSD (7) + GCT (3 * 2^(n+1)).
  let pos = 13;
  const gctFlag = gif[10] & 0x80;
  if (gctFlag) pos += 3 * (1 << ((gif[10] & 0x07) + 1));
  let count = 0;
  while (pos < gif.length) {
    const introducer = gif[pos];
    if (introducer === 0x3b) break; // trailer
    if (introducer === 0x21) {
      // extension: label, then sub-blocks
      pos += 2;
      while (gif[pos] !== 0) pos += gif[pos] + 1;
      pos += 1;
      continue;
    }
    if (introducer === 0x2c) {
      count++;
      const packed = gif[pos + 9];
      pos += 10;
      if (packed & 0x80) pos += 3 * (1 << ((packed & 0x07) + 1));
      pos += 1; // LZW min code size
      while (gif[pos] !== 0) pos += gif[pos] + 1;
      pos += 1;
      continue;
    }
    throw new Error(`unexpected block introducer 0x${introducer.toString(16)} at ${pos}`);
  }
  return count;
}

describe('encodeGif', () => {
  test('writes a GIF89a header and trailer', () => {
    const gif = encodeGif([solidFrame(4, 4, [255, 0, 0, 255])], { frameDelayMs: 40 });
    expect(new TextDecoder().decode(gif.subarray(0, 6))).toBe('GIF89a');
    expect(gif[gif.length - 1]).toBe(0x3b);
  });

  test('encodes one image descriptor per frame', () => {
    const frames = [
      solidFrame(8, 8, [255, 0, 0, 255]),
      solidFrame(8, 8, [0, 255, 0, 255]),
      solidFrame(8, 8, [0, 0, 255, 255]),
    ];
    const gif = encodeGif(frames, { frameDelayMs: 40 });
    expect(countImageDescriptors(gif)).toBe(3);
  });

  test('includes the NETSCAPE looping extension', () => {
    const gif = encodeGif([solidFrame(2, 2, [0, 0, 0, 255])], { frameDelayMs: 40 });
    expect(new TextDecoder().decode(gif).includes('NETSCAPE2.0')).toBe(true);
  });

  test('rejects mismatched frame sizes', () => {
    const frames = [solidFrame(2, 2, [0, 0, 0, 255]), solidFrame(3, 2, [0, 0, 0, 255])];
    expect(() => encodeGif(frames, { frameDelayMs: 40 })).toThrow(/does not match/);
  });

  test('rejects an empty frame list', () => {
    expect(() => encodeGif([], { frameDelayMs: 40 })).toThrow(/at least one frame/);
  });
});
