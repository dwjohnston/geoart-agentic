import { describe, expect, test } from 'bun:test';
import { DEFAULT_PREVIEW_SETTINGS, resolvePreviewSettings } from './previewSettings';

describe('resolvePreviewSettings', () => {
  test('returns defaults when previewSettings is absent', () => {
    expect(resolvePreviewSettings({})).toEqual(DEFAULT_PREVIEW_SETTINGS);
  });

  test('overrides only the provided fields', () => {
    expect(resolvePreviewSettings({ previewSettings: { animationNumFrames: 12 } })).toEqual({
      ...DEFAULT_PREVIEW_SETTINGS,
      animationNumFrames: 12,
    });
  });

  test('treats explicit undefined as absent', () => {
    expect(resolvePreviewSettings({ previewSettings: { staticImageNumTicks: undefined } })).toEqual(
      DEFAULT_PREVIEW_SETTINGS,
    );
  });
});
