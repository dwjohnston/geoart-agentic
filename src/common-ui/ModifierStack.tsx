import { useState } from 'react';

type AvailableType = { type: string; label: string };

type Props<T> = {
  items: T[];
  availableTypes: AvailableType[];
  onAdd: (type: string) => void;
  onRemove: (index: number) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
};

export function ModifierStack<T>({ items, availableTypes, onAdd, onRemove, renderItem }: Props<T>) {
  const [pickerOpen, setPickerOpen] = useState(false);

  function handleTypeSelect(type: string) {
    onAdd(type);
    setPickerOpen(false);
  }

  return (
    <div className="modifier-stack">
      <div className="modifier-stack-items">
        {items.map((item, index) => (
          <div key={index} className="modifier-stack-item">
            {renderItem(item, index)}
            <button
              data-testid={`modifier-remove-${index}`}
              onClick={() => onRemove(index)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      {availableTypes.length > 0 && (
        <div className="modifier-stack-footer">
          <button
            data-testid="modifier-add-btn"
            onClick={() => setPickerOpen(open => !open)}
          >
            +
          </button>
          {pickerOpen && (
            <div data-testid="modifier-type-picker" className="modifier-type-picker">
              {availableTypes.map(({ type, label }) => (
                <button
                  key={type}
                  data-testid={`modifier-type-${type}`}
                  onClick={() => handleTypeSelect(type)}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
