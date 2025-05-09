import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { jtlPlatformClient } from '@jtl/platform-internal-react/axios';
import { PluginInstance, PluginInstanceStatus } from '../../types';
import useUpdatePluginStatusCommand from '../useUpdatePluginStatusCommand';

vi.mock('@jtl/platform-internal-react/axios', () => ({
  jtlPlatformClient: {
    put: vi.fn(),
  },
}));

describe('useUpdatePluginStatusCommand', () => {
  // Mock plugin instance ID and status
  const mockPluginId = 'test-instance-id';
  const mockStatus: PluginInstanceStatus = 'SETUP_COMPLETED';

  const mockPluginInstance: PluginInstance = {
    id: mockPluginId,
    status: mockStatus,
    features: [],
    scopes: [],
    manifest: {
      manifestVersion: '1.0.0',
      version: '1.0.0',
      name: {
        short: 'Test Plugin',
        full: 'Test Plugin Full Name',
      },
      description: {
        short: 'Short description',
        full: 'Full description',
      },
      defaultLocale: 'en',
      locales: {},
      icon: {
        light: 'https://example.com/icon-light.png',
        dark: 'https://example.com/icon-dark.png',
      },
      communication: {
        supportUrl: 'https://example.com/support',
        guideUrl: 'https://example.com/guide',
      },
      legal: {
        gdprRequestUrl: 'https://example.com/gdpr-request',
        gdprDeleteUrl: 'https://example.com/gdpr-delete',
        privacyUrl: 'https://example.com/privacy',
        termsOfUseUrl: 'https://example.com/terms-of-use',
      },
      capabilities: {},
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockResponse = {
    data: mockPluginInstance,
  };

  const mockCommand = {
    id: mockPluginId,
    status: mockStatus,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls the API with the correct parameters', async () => {
    vi.mocked(jtlPlatformClient.put).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useUpdatePluginStatusCommand());

    act(() => {
      result.current.mutate(mockCommand);
    });

    await vi.waitFor(() => {
      expect(jtlPlatformClient.put).toHaveBeenCalledWith(`/plugin-service/plugins/${mockPluginId}/status`, {
        status: mockStatus,
      });
    });
  });

  it('calls success handler with the updated plugin instance', async () => {
    vi.mocked(jtlPlatformClient.put).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useUpdatePluginStatusCommand());

    const onSuccess = vi.fn();

    act(() => {
      result.current.mutate(mockCommand, { onSuccess });
    });

    await vi.waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('calls onError handler when API call fails', async () => {
    const mockError = new Error('Network Error');
    vi.mocked(jtlPlatformClient.put).mockRejectedValue(mockError);

    const { result } = renderHook(() => useUpdatePluginStatusCommand());
    const onErrorMock = vi.fn();

    act(() => {
      result.current.mutate(mockCommand, { onError: onErrorMock });
    });

    await vi.waitFor(() => {
      expect(onErrorMock).toHaveBeenCalled();
      const [[error, variables]] = onErrorMock.mock.calls;
      expect(error).toEqual(mockError);
      expect(variables).toEqual(mockCommand);
    });
  });
});
