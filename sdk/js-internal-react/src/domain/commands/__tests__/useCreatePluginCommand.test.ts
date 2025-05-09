import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { jtlPlatformClient } from '@jtl/platform-internal-react/axios';
import { Plugin, PluginManifest } from '../../types';
import useCreatePluginCommand from '../useCreatePluginCommand';
import { queryClient } from '@jtl/platform-internal-react/tanstack-query';

vi.mock('@jtl/platform-internal-react/axios', () => ({
  jtlPlatformClient: {
    post: vi.fn(),
  },
}));

vi.mock('@jtl/platform-internal-react/tanstack-query', () => ({
  queryClient: {
    invalidateQueries: vi.fn(),
  },
}));

describe('useCreatePluginCommand', () => {
  const mockManifest: PluginManifest = {
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
    locales: {
      en: {
        'translation.key': 'Translation value',
      },
    },
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
    capabilities: {
      hub: {
        appLauncher: {
          redirectUrl: 'https://example.com/app',
        },
      },
    },
  };

  const mockPlugin: Plugin = {
    id: 'test-plugin-id',
    clientId: 'test-client-id',
    name: 'Test Plugin',
    activeVersion: {
      id: 'test-version-id',
      manifest: mockManifest,
      submissionState: 'DRAFT',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    publisherId: 'test-publisher-id',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockResponse = {
    data: {
      plugin: mockPlugin,
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls the API with the correct parameters', async () => {
    vi.mocked(jtlPlatformClient.post).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useCreatePluginCommand());

    act(() => {
      result.current.mutate({ manifest: mockManifest });
    });

    await vi.waitFor(() => {
      expect(jtlPlatformClient.post).toHaveBeenCalledWith('/plugin-service/store/plugins', { manifest: mockManifest });
    });
  });

  it('returns plugin data and invalidates query on success', async () => {
    vi.mocked(jtlPlatformClient.post).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useCreatePluginCommand());

    const onSuccess = vi.fn();

    act(() => {
      result.current.mutate({ manifest: mockManifest }, { onSuccess });
    });

    await vi.waitFor(() => {
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['plugins'] });
      expect(onSuccess).toHaveBeenCalled();

      const [resultData] = onSuccess.mock.calls[0];
      expect(resultData).toMatchObject(mockResponse.data);
    });
  });

  it('calls onError handler when API call fails', async () => {
    const mockError = new Error('Network Error');
    vi.mocked(jtlPlatformClient.post).mockRejectedValue(mockError);

    const { result } = renderHook(() => useCreatePluginCommand());
    const onErrorMock = vi.fn();

    act(() => {
      result.current.mutate({ manifest: mockManifest }, { onError: onErrorMock });
    });

    await vi.waitFor(() => {
      expect(onErrorMock).toHaveBeenCalled();
      const [[error, variables]] = onErrorMock.mock.calls;
      expect(error).toEqual(mockError);
      expect(variables).toEqual({ manifest: mockManifest });
    });
  });
});
