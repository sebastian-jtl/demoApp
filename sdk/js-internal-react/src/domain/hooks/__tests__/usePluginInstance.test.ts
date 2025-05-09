import { describe, it, expect, vi, beforeEach } from 'vitest';
import usePluginInstance from '../usePluginInstance';

describe('usePluginInstance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(usePluginInstance).toBeDefined();
  });
});
