const SPEED_VALUES = [1/8, 1/6, 1/4, 1/3, 1/2, 1, 2, 3, 4, 6, 8];

function formatSpeed(v: number): string {
  if (v < 1) return `1/${Math.round(1 / v)}×`;
  return `${Math.round(v)}×`;
}

type Props = {
  speed: number;
  onChange: (value: number) => void;
};

export function SpeedControl({ speed, onChange }: Props) {
  const index = SPEED_VALUES.findIndex(v => Math.abs(v - speed) < 1e-9);
  const safeIndex = index === -1 ? SPEED_VALUES.indexOf(1) : index;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 13, color: '#aaa' }}>Speed: {formatSpeed(SPEED_VALUES[safeIndex])}</label>
      <input
        type="range"
        min={0}
        max={SPEED_VALUES.length - 1}
        step={1}
        value={safeIndex}
        onChange={e => onChange(SPEED_VALUES[parseInt(e.target.value, 10)])}
        style={{ width: '100%' }}
      />
    </div>
  );
}
