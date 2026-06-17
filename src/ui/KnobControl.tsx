import { useRef, useState } from 'react';


const DEFAULT_NUM_TICKS = 100;
type Props = {
  initialValue: number;
  min: number;
  max: number;
  step?: number;
  scale?: "linear" | "log";
  variant?: "regular" | "coarse-fine";
  size?: 'sm' | 'lg';
  label: string;
  snapTo?: number;
  onChange?: (value: number) => void;
};

// 200 px of vertical drag covers the full range
const DRAG_TRAVEL_PX = 200;

// Indicator line rotates from -135° (min) to +135° (max)
const ROTATION_MIN = -135;
const ROTATION_MAX = 135;

function valueToRotation(value: number, min: number, max: number, scale: "linear" | "log" = "linear"): number {
  let fraction: number;

  if (scale === "log" && min > 0 && max > 0) {
    fraction = (Math.log(value) - Math.log(min)) / (Math.log(max) - Math.log(min));
  } else {
    fraction = (value - min) / (max - min);
  }

  return ROTATION_MIN + fraction * (ROTATION_MAX - ROTATION_MIN);
}

export function KnobControl({ initialValue, min, max, scale = "log", step, size = 'lg', variant = 'regular', label, snapTo, onChange }: Props) {
  const [value, setValue] = useState(initialValue);
  const [coarseValue, setCoarseValue] = useState(initialValue);
  const [fineValue, setFineValue] = useState(0);

  // Calculate snap values
  const getSnapValue = (min: number, max: number): number => {
    if (snapTo !== undefined) return snapTo;
    return min <= 0 && max >= 0 ? 0 : min;
  };

  const snapValueRegular = getSnapValue(min, max);
  const snapValueCoarse = getSnapValue(min, max);
  const snapValueFine = 0;

  const diameter = size === 'lg' ? 64 : 36;
  const strokeWidth = size === 'lg' ? 3 : 2;
  const indicatorLength = diameter / 2 - strokeWidth - 2;

  const dragStartY = useRef<number | null>(null);
  const dragStartValue = useRef<number>(value);
  const [isDragging, setIsDragging] = useState(false);
  const [draggingKnob, setDraggingKnob] = useState<'regular' | 'coarse' | 'fine' | null>(null);

  const range = max - min;

  // Calculate step sizes based on whether step is provided
  let stepSize: number;
  let coarseStepSize: number;
  let fineStepSize: number;

  if (step !== undefined) {
    const numTicks = range / step;
    const ticksPerKnob = Math.sqrt(numTicks);
    coarseStepSize = step * ticksPerKnob;
    fineStepSize = step;
    stepSize = step;
  } else {
    const numTicks = DEFAULT_NUM_TICKS;
    const ticksPerKnob = Math.sqrt(numTicks);
    stepSize = range / DEFAULT_NUM_TICKS;
    coarseStepSize = range / ticksPerKnob;
    fineStepSize = coarseStepSize / ticksPerKnob;
  }

  const isCoarseFine = variant === 'coarse-fine';

  const snapToStep = (val: number, stepVal: number): number => {
    return Math.round(val / stepVal) * stepVal;
  };

  const updateCombinedValue = (coarse: number, fine: number) => {
    const combined = Math.min(max, Math.max(min, coarse + fine));
    setValue(combined);
    onChange?.(combined);
  };

  const handleDoubleClick = (knobType: 'regular' | 'coarse' | 'fine') => {
    if (knobType === 'regular') {
      setValue(snapValueRegular);
      onChange?.(snapValueRegular);
    } else if (knobType === 'coarse') {
      setCoarseValue(snapValueCoarse);
      updateCombinedValue(snapValueCoarse, fineValue);
    } else if (knobType === 'fine') {
      setFineValue(snapValueFine);
      updateCombinedValue(coarseValue, snapValueFine);
    }
  };

  const createMouseDownHandler = (knobType: 'regular' | 'coarse' | 'fine') => {
    return (e: React.MouseEvent) => {
      if (e.detail === 2) {
        handleDoubleClick(knobType);
        return;
      }
      e.preventDefault();
      dragStartY.current = e.clientY;
      dragStartValue.current = knobType === 'coarse' ? coarseValue : knobType === 'fine' ? fineValue : value;
      setIsDragging(true);
      setDraggingKnob(knobType);

      function handleMouseMove(moveEvent: MouseEvent) {
        if (dragStartY.current === null) return;
        const dy = dragStartY.current - moveEvent.clientY;
        const fraction = dy / DRAG_TRAVEL_PX;

        const calculateNewValue = (startVal: number, minVal: number, maxVal: number, frac: number): number => {
          if (scale === 'log' && minVal > 0 && maxVal > 0) {
            const logMin = Math.log(minVal);
            const logMax = Math.log(maxVal);
            const logStart = Math.log(startVal);
            const logRange = logMax - logMin;
            const newLogVal = logStart + frac * logRange;
            return Math.exp(newLogVal);
          } else {
            return startVal + frac * (maxVal - minVal);
          }
        };

        if (knobType === 'regular') {
          const newValue = calculateNewValue(dragStartValue.current, min, max, fraction);
          const clampedValue = Math.min(max, Math.max(min, newValue));
          const snappedValue = snapToStep(clampedValue, stepSize);
          setValue(snappedValue);
          onChange?.(snappedValue);
        } else if (knobType === 'coarse') {
          const newValue = calculateNewValue(dragStartValue.current, min, max, fraction);
          const clampedValue = Math.min(max, Math.max(min, newValue));
          const newCoarse = snapToStep(clampedValue, coarseStepSize);
          setCoarseValue(newCoarse);
          updateCombinedValue(newCoarse, fineValue);
        } else if (knobType === 'fine') {
          const newValue = calculateNewValue(dragStartValue.current, 0, coarseStepSize, fraction);
          const clampedValue = Math.min(coarseStepSize, Math.max(0, newValue));
          const newFine = snapToStep(clampedValue, fineStepSize);
          setFineValue(newFine);
          updateCombinedValue(coarseValue, newFine);
        }
      }

      function handleMouseUp() {
        dragStartY.current = null;
        setIsDragging(false);
        setDraggingKnob(null);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      }

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };
  };

  const cx = diameter / 2;
  const cy = diameter / 2;
  const radius = diameter / 2 - strokeWidth;

  // Format value to max 5 digits
  const formatValue = (num: number): string => {
    let str = num.toFixed(2);
    if (str.length > 5) {
      str = num.toFixed(1);
      if (str.length > 5) {
        str = Math.round(num).toString();
      }
    }
    return str;
  };

  const renderKnob = (knobValue: number, knobMin: number, knobMax: number, knobType: 'regular' | 'coarse' | 'fine', label?: string) => {
    const knobRotation = valueToRotation(knobValue, knobMin, knobMax, scale);
    const angleRad = ((knobRotation - 90) * Math.PI) / 180;
    const knobX2 = cx + indicatorLength * Math.cos(angleRad);
    const knobY2 = cy + indicatorLength * Math.sin(angleRad);

    const labelLetter = knobType === 'coarse' ? 'C' : knobType === 'fine' ? 'F' : '';
    const labelFontSize = size === 'lg' ? 10 : 6;

    return (
      <svg
        key={knobType}
        width={diameter}
        height={diameter}
        onMouseDown={createMouseDownHandler(knobType)}
        style={{ cursor: isDragging && draggingKnob === knobType ? 'ns-resize' : 'pointer' }}
        aria-label={label || ''}
        role="slider"
        aria-valuenow={knobValue}
        aria-valuemin={knobMin}
        aria-valuemax={knobMax}
      >
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="#2a2a2a"
          stroke="#555"
          strokeWidth={strokeWidth}
        />
        <line
          x1={cx}
          y1={cy}
          x2={knobX2}
          y2={knobY2}
          stroke="#e0e0e0"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {isCoarseFine && labelLetter && (
          <text
            x={diameter - 2}
            y={2}
            textAnchor="end"
            dominantBaseline="text-before-edge"
            fontSize={labelFontSize}
            fill="#999"
            fontWeight="bold"
            pointerEvents="none"
          >
            {labelLetter}
          </text>
        )}
      </svg>
    );
  };

  return (
    <div
      className="knob-control"
      style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', userSelect: 'none' }}
    >
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center', width: isCoarseFine ? 160 : 80 }}>
        {isCoarseFine ? (
          <>
            {renderKnob(coarseValue, min, max, 'coarse', `${label} (coarse)`)}
            {renderKnob(fineValue, 0, coarseStepSize, 'fine', `${label} (fine)`)}
          </>
        ) : (
          renderKnob(value, min, max, 'regular', label)
        )}
      </div>
      <span style={{ fontSize: '0.6rem', color: '#666', marginTop: 4, fontFamily: 'monospace', minHeight: '1em' }}>
        {formatValue(value)}
      </span>
      <span style={{ fontSize: size === 'lg' ? '0.75rem' : '0.65rem', color: '#aaa', marginTop: 2 }}>
        {label}
      </span>
    </div>
  );
}
