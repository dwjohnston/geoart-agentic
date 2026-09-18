import { GIFEncoder, quantize, applyPalette } from 'gifenc';

export type RgbaFrame = {
  /** Flat RGBA pixel data, `width * height * 4` bytes. */
  pixels: Uint8Array | Uint8ClampedArray;
  width: number;
  height: number;
};

export type GifEncodingOptions = {
  /** How long each frame is shown for. */
  frameDelayMs: number;
  /** Max palette size per frame (GIF caps this at 256). */
  maxColors?: number;
  /**
   * Colour precision used while quantising. `rgb565` (default) keeps more
   * colour detail; `rgb444` bins colours into 4 bits per channel and
   * quantises roughly 30x faster — measured 80ms → 3ms per 400x400 frame —
   * at the cost of visible banding in gradients.
   */
  colorFormat?: 'rgb565' | 'rgb444';
};

/**
 * Encodes a sequence of RGBA frames as a looping GIF. Frames are quantised
 * to a per-frame palette — the art is flat vector shapes on a dark
 * background, which is what gifenc's quantiser is suited to. Every frame
 * must share the first frame's dimensions.
 *
 * Runs in the browser, Bun, and workerd (gifenc is pure JS).
 */
export function encodeGif(frames: Iterable<RgbaFrame>, options: GifEncodingOptions): Uint8Array {
  const maxColors = options.maxColors ?? 256;
  const colorFormat = options.colorFormat ?? 'rgb565';
  const encoder = GIFEncoder();
  let size: { width: number; height: number } | null = null;

  for (const frame of frames) {
    if (!size) {
      size = { width: frame.width, height: frame.height };
    } else if (frame.width !== size.width || frame.height !== size.height) {
      throw new Error(
        `encodeGif: frame size ${frame.width}x${frame.height} does not match first frame ${size.width}x${size.height}`,
      );
    }
    const palette = quantize(frame.pixels, maxColors, { format: colorFormat });
    const index = applyPalette(frame.pixels, palette, colorFormat);
    encoder.writeFrame(index, frame.width, frame.height, { palette, delay: options.frameDelayMs, repeat: 0 });
  }

  if (!size) {
    throw new Error('encodeGif: at least one frame is required');
  }

  encoder.finish();
  return encoder.bytes();
}
