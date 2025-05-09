import { describe, it, expect, vi, beforeEach } from 'vitest';
import usePlugin from '../usePlugin';

describe('usePluginInstance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(usePlugin).toBeDefined();
  });
});
