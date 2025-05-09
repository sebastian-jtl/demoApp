import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { jtlPlatformClient } from '@jtl/platform-internal-react/axios';
import { PluginInstance } from '../../types';
import useInstallPluginCommand from '../useInstallPluginCommand';
import { queryClient } from '@jtl/platform-internal-react/tanstack-query';

// Mock the axios client
vi.mock('@jtl/platform-internal-react/axios', () => ({
  jtlPlatformClient: {
    post: vi.fn(),
  },
}));

// Mock the query client
vi.mock('@jtl/platform-internal-react/tanstack-query', () => ({
  queryClient: {
    invalidateQueries: vi.fn(),
  },
}));

describe('useInstallPluginCommand', () => {
  // Mock plugin ID and instance
  const mockPluginId = 'test-plugin-id';

  const mockPluginInstance: PluginInstance = {
    id: 'test-instance-id',
    status: 'SETUP_PENDING',
    scopes: [],
    features: [],
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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls the API with the correct parameters', async () => {
    vi.mocked(jtlPlatformClient.post).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useInstallPluginCommand());

    act(() => {
      result.current.mutate({ pluginId: mockPluginId });
    });

    await vi.waitFor(() => {
      expect(jtlPlatformClient.post).toHaveBeenCalledWith(`/plugin-service/store/plugins/${mockPluginId}/install`, {});
    });
  });

  it('returns plugin instance and invalidates query on success', async () => {
    vi.mocked(jtlPlatformClient.post).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useInstallPluginCommand());

    const onSuccess = vi.fn();

    act(() => {
      result.current.mutate({ pluginId: mockPluginId }, { onSuccess });
    });

    await vi.waitFor(() => {
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['plugin-instances'] });
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('calls onError handler when API call fails', async () => {
    const mockError = new Error('Network Error');
    vi.mocked(jtlPlatformClient.post).mockRejectedValue(mockError);

    const { result } = renderHook(() => useInstallPluginCommand());
    const onErrorMock = vi.fn();

    act(() => {
      result.current.mutate({ pluginId: mockPluginId }, { onError: onErrorMock });
    });

    await vi.waitFor(() => {
      expect(onErrorMock).toHaveBeenCalled();
      const [[error, variables]] = onErrorMock.mock.calls;
      expect(error).toEqual(mockError);
      expect(variables).toEqual({ pluginId: mockPluginId });
    });
  });
});
