import { KnobControl } from '../../../ui/KnobControl';

type Props = {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  initialValue: number;
  onChange: (value: number) => void;
};

export function SliderControl({ id, label, min, max, step, initialValue, onChange }: Props) {
  return (
    <div className="slider-control" data-testid={`${id}-output`}
    >
      <KnobControl

        label={label}
        min={min}
        max={max}
        step={step}
        initialValue={initialValue}
        onChange={onChange}
      />
    </div >
  );
}
