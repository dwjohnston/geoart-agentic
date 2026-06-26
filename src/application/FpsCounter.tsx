import { forwardRef, useImperativeHandle, useRef, useState } from 'react';

export type FpsCounterHandle = {
  tick: () => void;
};

export const FpsCounter = forwardRef<FpsCounterHandle>(function FpsCounter(_, ref) {
  const [fps, setFps] = useState(0);
  const frameCount = useRef(0);
  const lastUpdate = useRef(0);

  useImperativeHandle(ref, () => ({
    tick() {
      frameCount.current++;
      const now = performance.now();
      const elapsed = now - lastUpdate.current;
      if (elapsed >= 1000) {
        setFps(Math.round((frameCount.current * 1000) / elapsed));
        frameCount.current = 0;
        lastUpdate.current = now;
      }
    },
  }));

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 8,
        right: 10,
        color: 'rgba(255,255,255,0.5)',
        fontSize: 11,
        fontFamily: 'monospace',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      {fps} fps
    </div>
  );
});
