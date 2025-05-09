import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { jtlPlatformClient } from '@jtl/platform-internal-react/axios';
import { Plugin, PluginManifest } from '../../types';
import useUpdatePluginCommand from '../useUpdatePluginCommand';

vi.mock('@jtl/platform-internal-react/axios', () => ({
  jtlPlatformClient: {
    put: vi.fn(),
  },
}));

describe('useUpdatePluginCommand', () => {
  // Mock plugin ID and status
  const mockPluginId = 'test-plugin-id';
  const pluginManifest: PluginManifest = {
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
  };

  const mockPlugin: Plugin = {
    id: mockPluginId,
    clientId: 'test-client-id',
    name: 'test-plugin',
    publisherId: 'test-publisher-id',
    activeVersion: {
      id: 'test-version-id',
      updatedAt: new Date(),
      createdAt: new Date(),
      submissionState: 'APPROVED',
      manifest: pluginManifest,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const mockClientId = 'test-client-id';

  const mockResponse = {
    data: {
      clientId: mockClientId,
      plugin: mockPlugin,
    },
  };

  const mockCommand = {
    pluginId: mockPluginId,
    manifest: mockPlugin.activeVersion.manifest,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls the API with the correct parameters', async () => {
    vi.mocked(jtlPlatformClient.put).mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useUpdatePluginCommand());

    act(() => {
      result.current.mutate(mockCommand);
    });

    await vi.waitFor(() => {
      expect(jtlPlatformClient.put).toHaveBeenCalledWith(`/plugin-service/store/plugins/${mockPluginId}/manifest`, {
        manifest: pluginManifest,
      });
    });
  });

  it('calls success handler with the updated plugin', async () => {
    vi.mocked(jtlPlatformClient.put).mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useUpdatePluginCommand());

    const onSuccess = vi.fn();

    act(() => {
      result.current.mutate(mockCommand, { onSuccess });
    });

    await vi.waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('calls success handler with no plugin update', async () => {
    vi.mocked(jtlPlatformClient.put).mockResolvedValueOnce({
      status: 204,
    });

    const { result } = renderHook(() => useUpdatePluginCommand());

    const onSuccess = vi.fn();

    act(() => {
      result.current.mutate(mockCommand, { onSuccess });
    });

    await vi.waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('calls failure handler with invalid plugin update', async () => {
    const mockError = Error('No plugin data returned');
    vi.mocked(jtlPlatformClient.put).mockResolvedValueOnce({
      status: 200,
      // no data field
    });

    const { result } = renderHook(() => useUpdatePluginCommand());

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

  it('calls onError handler when API call fails', async () => {
    const mockError = new Error('Network Error');
    vi.mocked(jtlPlatformClient.put).mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useUpdatePluginCommand());
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
