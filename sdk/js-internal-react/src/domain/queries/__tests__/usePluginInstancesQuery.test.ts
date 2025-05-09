import { jtlPlatformClient } from '@jtl/platform-internal-react/axios';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import usePluginInstancesQuery from '../usePluginInstancesQuery';
import { createStore, Provider as JotaiProvider } from '@jtl/platform-internal-react/jotai';
import { createElement } from 'react';
import { PluginCapability, PluginInstance } from '../../types';
import { pluginInstanceCollectionAtom } from '../../state';

vi.mock('@jtl/platform-internal-react/axios', () => ({
  jtlPlatformClient: {
    get: vi.fn(),
    environment: {
      tenantId: 'tenant-1',
    },
  },
}));

vi.mock('../../state', () => ({
  pluginInstanceCollectionAtom: {
    mapToAtoms: vi.fn(),
  },
}));

describe('usePluginInstancesQuery', () => {
  const mockCapability: PluginCapability = 'hub';
  const mockPluginInstances: PluginInstance[] = [
    {
      id: 'instance-1',
      status: 'SETUP_COMPLETED',
      scopes: ['scope1', 'scope2'],
      features: ['feature1'],
      manifest: {
        manifestVersion: '1.0.0',
        version: '1.0.0',
        name: {
          short: 'Test Plugin 1',
          full: 'Test Plugin 1 Full Name',
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
        capabilities: {
          hub: {
            appLauncher: {
              redirectUrl: 'https://example.com/redirect',
            },
          },
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'instance-2',
      status: 'SETUP_PENDING',
      scopes: ['scope3'],
      features: ['feature2', 'feature3'],
      manifest: {
        manifestVersion: '1.0.0',
        version: '1.0.0',
        name: {
          short: 'Test Plugin 2',
          full: 'Test Plugin 2 Full Name',
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
        capabilities: {
          hub: {
            appLauncher: {
              redirectUrl: 'https://example.com/redirect',
            },
          },
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(jtlPlatformClient.get).mockResolvedValue({ data: mockPluginInstances });
    vi.mocked(jtlPlatformClient.environment).tenantId = 'tenant-1';
  });

  it('should not be called if tenantId is not available', () => {
    vi.mocked(jtlPlatformClient.environment).tenantId = undefined;

    const { result } = renderHook(() => usePluginInstancesQuery(mockCapability));

    expect(result.current.fetchStatus).toBe('idle');
    expect(result.current.data).toBeUndefined();
    expect(jtlPlatformClient.get).not.toHaveBeenCalled();
  });

  it('should call the API with the correct query parameters', async () => {
    renderHook(() => usePluginInstancesQuery(mockCapability));
    expect(jtlPlatformClient.get).toHaveBeenCalledWith(`plugin-service/plugins?capability=${mockCapability}`);
  });

  describe('when the API call is successful', () => {
    it('should map the response data to atoms', () => {
      renderHook(() => usePluginInstancesQuery(mockCapability));
      vi.waitFor(() => expect(pluginInstanceCollectionAtom.mapToAtoms).toHaveBeenCalledWith(mockPluginInstances));
    });

    it('should return the mapped atoms', () => {
      const { result } = renderHook(() => usePluginInstancesQuery(mockCapability));
      vi.waitFor(() => expect(result.current.data).toEqual(mockPluginInstances));
    });

    it('should return the mapped plugin instances as atoms', () => {
      const store = createStore();
      const { result } = renderHook(() => usePluginInstancesQuery(mockCapability), {
        wrapper: ({ children }: React.PropsWithChildren) => createElement(JotaiProvider, { store }, children),
      });

      vi.waitFor(() => {
        const atomList = store.get(result.current.data!);
        expect(atomList.length === mockPluginInstances.length).toBe(true);
      });
    });
  });

  describe('when the API call fails', () => {
    it('should handle error when fetching plugin instances fails', () => {
      vi.spyOn(console, 'error').mockImplementation(vi.fn());
      const mockError = new Error('Network Error');
      vi.mocked(jtlPlatformClient.get).mockRejectedValue(mockError);

      const { result } = renderHook(() => usePluginInstancesQuery(mockCapability));

      vi.waitFor(() => {
        expect(result.current.error).toEqual(mockError);
      });
    });
  });
});
