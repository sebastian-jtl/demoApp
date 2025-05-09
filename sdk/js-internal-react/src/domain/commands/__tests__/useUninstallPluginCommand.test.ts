import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { jtlPlatformClient } from '@jtl/platform-internal-react/axios';
import useUninstallPluginCommand from '../useUninstallPluginCommand';

vi.mock('@jtl/platform-internal-react/axios', () => ({
  jtlPlatformClient: {
    delete: vi.fn(),
  },
}));

describe('useUninstallPluginCommand', () => {
  // Mock plugin instance ID
  const mockPluginInstanceId = 'test-instance-id';

  const mockResponse = {
    status: 204,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls the API with the correct parameters', async () => {
    vi.mocked(jtlPlatformClient.delete).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useUninstallPluginCommand());

    act(() => {
      result.current.mutate({ pluginInstanceId: mockPluginInstanceId });
    });

    await vi.waitFor(() => {
      expect(jtlPlatformClient.delete).toHaveBeenCalledWith(`/plugin-service/plugins/${mockPluginInstanceId}`);
    });
  });

  it('calls success handler after API call completes', async () => {
    vi.mocked(jtlPlatformClient.delete).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useUninstallPluginCommand());

    const onSuccess = vi.fn();

    act(() => {
      result.current.mutate({ pluginInstanceId: mockPluginInstanceId }, { onSuccess });
    });

    await vi.waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('calls onError handler when API call fails', async () => {
    const mockError = new Error('Network Error');
    vi.mocked(jtlPlatformClient.delete).mockRejectedValue(mockError);

    const { result } = renderHook(() => useUninstallPluginCommand());
    const onErrorMock = vi.fn();

    act(() => {
      result.current.mutate({ pluginInstanceId: mockPluginInstanceId }, { onError: onErrorMock });
    });

    await vi.waitFor(() => {
      expect(onErrorMock).toHaveBeenCalled();
      const [[error, variables]] = onErrorMock.mock.calls;
      expect(error).toEqual(mockError);
      expect(variables).toEqual({ pluginInstanceId: mockPluginInstanceId });
    });
  });
});
