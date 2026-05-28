import type { RefObject } from 'react';

type Props = {
  orbitCanvasRef: RefObject<HTMLCanvasElement | null>;
  trailCanvasRef: RefObject<HTMLCanvasElement | null>;
  size: number;
};

export function Canvas({ orbitCanvasRef, trailCanvasRef, size }: Props) {
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
        ref={trailCanvasRef}
        width={size}
        height={size}
        data-testid="paint-canvas"
        style={{ position: 'absolute', top: 0, left: 0 }}
      />
      <canvas
        ref={orbitCanvasRef}
        width={size}
        height={size}
        data-testid="live-canvas"
        style={{ position: 'absolute', top: 0, left: 0 }}
      />
    </div>
  );
}
