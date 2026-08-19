import { useState } from 'react';
import { Modal } from './Modal';
import { exportReactComponentFileName, generateReactComponentSource } from './exportReactComponent';
import type { ExportableAlgorithm } from './exportReactComponent';

type Props = {
  algorithm: ExportableAlgorithm;
  onClose: () => void;
};

export function ExportAlgorithmModal({ algorithm, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const source = generateReactComponentSource(algorithm);
  const fileName = exportReactComponentFileName(algorithm);

  async function handleCopy() {
    await navigator.clipboard.writeText(source);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const blob = new Blob([source], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <Modal title="Export React Component" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '70vw', maxWidth: 900 }}>
        <label style={{ fontSize: 13, color: '#aaa' }}>
          Standalone <code>{fileName}</code> for embedding "{algorithm.name}" in another React project:
        </label>
        <textarea
          data-testid="export-source"
          value={source}
          readOnly
          rows={18}
          spellCheck={false}
          style={{
            background: '#111',
            color: '#eee',
            border: '1px solid #333',
            borderRadius: 4,
            padding: 8,
            fontSize: 12,
            fontFamily: 'monospace',
            resize: 'vertical',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button
            onClick={handleCopy}
            style={{
              background: 'none',
              border: '1px solid #444',
              borderRadius: 4,
              color: '#aaa',
              padding: '6px 16px',
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={handleDownload}
            style={{
              background: '#3a5a8a',
              border: 'none',
              borderRadius: 4,
              color: '#eee',
              padding: '6px 16px',
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            Download
          </button>
        </div>
      </div>
    </Modal>
  );
}
