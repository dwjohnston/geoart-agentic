type Props = {
  signalFn: (t: number) => number;
  cycleLength: number;
  width?: number;
  height?: number;
};

export function WaveformPreview({ signalFn, cycleLength, width = 80, height = 32 }: Props) {
  const windowLength = cycleLength * 2;
  const sampleCount = 100;
  const midY = height / 2;

  const points = Array.from({ length: sampleCount }, (_, i) => {
    const t = (i / (sampleCount - 1)) * windowLength;
    const x = (i / (sampleCount - 1)) * width;
    const y = midY - signalFn(t) * midY;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg
      width={width}
      height={height}
      data-testid="waveform-preview"
    >
      <line
        x1={0}
        y1={midY}
        x2={width}
        y2={midY}
        stroke="currentColor"
        opacity={0.3}
      />
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        data-testid="waveform-polyline"
      />
    </svg>
  );
}
