import { KnobControl } from '../ui/KnobControl';
const SPEED_VALUES = [1 / 8, 1 / 6, 1 / 4, 1 / 3, 1 / 2, 1, 2, 3, 4, 6, 8, 16, 32, 64, 128, 256, 512, 1024];


type Props = {
  speed: number;
  onChange: (value: number) => void;
};

export function SpeedControl({ speed, onChange }: Props) {
  const index = SPEED_VALUES.findIndex(v => Math.abs(v - speed) < 1e-9);
  const safeIndex = index === -1 ? SPEED_VALUES.indexOf(1) : index;

  return (
    <KnobControl
      label="Speed"
      min={0}
      max={SPEED_VALUES.length - 1}
      step={1}
      initialValue={safeIndex}
      onChange={(value) => onChange(SPEED_VALUES[Math.round(value)])}
    />
  );
}
