type Props = {
  speed: number;
  onChange: (value: number) => void;
};

export function SpeedControl({ speed, onChange }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 13, color: '#aaa' }}>Speed: {speed.toFixed(2)}x</label>
      <input
        type="range"
        min={0.125}
        max={8}
        step={0.125}
        value={speed}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ width: '100%' }}
      />
    </div>
  );
}
