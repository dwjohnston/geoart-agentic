import type { RefObject } from 'react';
import { FpsCounter, type FpsCounterHandle } from './FpsCounter';

type Props = {
  liveCanvasRef: RefObject<HTMLCanvasElement | null>;
  paintCanvasRef: RefObject<HTMLCanvasElement | null>;
  size: number;
  fpsCounterRef: RefObject<FpsCounterHandle | null>;
};

export function Canvas({ liveCanvasRef, paintCanvasRef, size, fpsCounterRef }: Props) {
  return (
    <div
      style={{
        position: 'relative',
        width: size,
        maxWidth: '100%',
        aspectRatio: '1 / 1',
        flexShrink: 0,
        background: '#0a0a0f',
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      <canvas
        ref={paintCanvasRef}
        width={size}
        height={size}
        data-testid="paint-canvas"
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      />
      <canvas
        ref={liveCanvasRef}
        width={size}
        height={size}
        data-testid="live-canvas"
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      />
      <FpsCounter ref={fpsCounterRef} />
    </div>
  );
}
