import { useEffect } from 'react';

type Props = {
  message: string;
  onDismiss: () => void;
  durationMs?: number;
};

export function Toast({ message, onDismiss, durationMs = 2000 }: Props) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(timer);
  }, [onDismiss, durationMs]);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#2a2a3a',
        color: '#eee',
        padding: '10px 20px',
        borderRadius: 6,
        border: '1px solid #444',
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        zIndex: 2000,
        fontSize: 14,
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
      }}
    >
      {message}
    </div>
  );
}
