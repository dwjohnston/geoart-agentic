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
        height: size,
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
        style={{ position: 'absolute', top: 0, left: 0 }}
      />
      <canvas
        ref={liveCanvasRef}
        width={size}
        height={size}
        data-testid="live-canvas"
        style={{ position: 'absolute', top: 0, left: 0 }}
      />
      <FpsCounter ref={fpsCounterRef} />
    </div>
  );
}
