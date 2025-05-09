import { jtlPlatformClient } from '@jtl/platform-internal-react/axios';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import usePluginsQuery from '../usePluginsQuery';
import { createStore, Provider as JotaiProvider } from '@jtl/platform-internal-react/jotai';
import { createElement } from 'react';
import { Plugin, PluginSubmissionState } from '../../types';
import { pluginCollectionAtom } from '../../state';

vi.mock('@jtl/platform-internal-react/axios', () => ({
  jtlPlatformClient: {
    get: vi.fn(),
    environment: {
      tenantId: 'tenant-1',
    },
  },
}));

vi.mock('../../state', () => ({
  pluginCollectionAtom: {
    mapToAtoms: vi.fn(),
  },
}));

describe('usePluginsQuery', () => {
  const mockPublisherId = 'publisher-123';
  const mockSubmissionState: PluginSubmissionState = 'APPROVED';
  const mockOnlyPluginsOfTenant = true;

  const mockPlugins: Plugin[] = [
    {
      id: 'plugin-1',
      name: 'Test Plugin 1',
      publisherId: 'publisher-123',
      clientId: 'client-123',
      activeVersion: {
        id: 'version-1',
        manifest: {
          name: {
            short: 'Test Plugin 1',
            full: 'Test Plugin 1 Full Name',
          },
          description: {
            short: 'Short description',
            full: 'Full description',
          },
          manifestVersion: '1.0.0',
          version: '1.0.0',
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
        submissionState: 'APPROVED',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'plugin-2',
      name: 'Test Plugin 2',
      publisherId: 'publisher-456',
      clientId: 'client-456',
      activeVersion: {
        id: 'version-2',
        manifest: {
          name: {
            short: 'Test Plugin 2',
            full: 'Test Plugin 2 Full Name',
          },
          description: {
            short: 'Short description 2',
            full: 'Full description 2',
          },
          manifestVersion: '1.0.0',
          version: '2.0.0',
          defaultLocale: 'en',
          locales: {},
          icon: {
            light: 'https://example.com/icon-light2.png',
            dark: 'https://example.com/icon-dark2.png',
          },
          communication: {
            supportUrl: 'https://example.com/support2',
            guideUrl: 'https://example.com/guide2',
          },
          legal: {
            gdprRequestUrl: 'https://example.com/gdpr-request2',
            gdprDeleteUrl: 'https://example.com/gdpr-delete2',
            privacyUrl: 'https://example.com/privacy2',
            termsOfUseUrl: 'https://example.com/terms-of-use2',
          },
          capabilities: {
            hub: {
              appLauncher: {
                redirectUrl: 'https://example.com/redirect2',
              },
            },
          },
        },
        submissionState: 'SUBMITTED',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(jtlPlatformClient.get).mockResolvedValue({ data: mockPlugins });
    vi.mocked(jtlPlatformClient.environment).tenantId = 'tenant-1';
  });

  it('should not be called when tenantId is not available', () => {
    vi.mocked(jtlPlatformClient.environment).tenantId = undefined;

    const { result } = renderHook(() => usePluginsQuery());

    expect(result.current.fetchStatus).toBe('idle');
    expect(result.current.data).toBeUndefined();
    expect(jtlPlatformClient.get).not.toHaveBeenCalled();
  });

  it('should call the API with no query parameters when no query is provided', () => {
    renderHook(() => usePluginsQuery());
    expect(jtlPlatformClient.get).toHaveBeenCalledWith('plugin-service/store/plugins?');
  });

  it('should call the API with the correct query parameters when submissionState is provided', () => {
    const query = { submissionState: mockSubmissionState };
    renderHook(() => usePluginsQuery(query));
    expect(jtlPlatformClient.get).toHaveBeenCalledWith(`plugin-service/store/plugins?submission-state=${mockSubmissionState}`);
  });

  it('should call the API with the correct query parameters when publisherId is provided', () => {
    const query = { publisherId: mockPublisherId };
    renderHook(() => usePluginsQuery(query));
    expect(jtlPlatformClient.get).toHaveBeenCalledWith(`plugin-service/store/plugins?publisher-id=${mockPublisherId}`);
  });

  it('should call the API with the correct query parameters when onlyPluginsOfTenant is provided', () => {
    const query = { onlyPluginsOfTenant: mockOnlyPluginsOfTenant };
    renderHook(() => usePluginsQuery(query));
    expect(jtlPlatformClient.get).toHaveBeenCalledWith(`plugin-service/store/plugins?only-plugins-of-tenant=${mockOnlyPluginsOfTenant}`);
  });

  it('should call the API with all query parameters when all are provided', () => {
    const query = {
      submissionState: mockSubmissionState,
      publisherId: mockPublisherId,
      onlyPluginsOfTenant: mockOnlyPluginsOfTenant,
    };
    renderHook(() => usePluginsQuery(query));
    expect(jtlPlatformClient.get).toHaveBeenCalledWith(
      `plugin-service/store/plugins?submission-state=${mockSubmissionState}&publisher-id=${mockPublisherId}&only-plugins-of-tenant=${mockOnlyPluginsOfTenant}`,
    );
  });

  describe('when the API call is successful', () => {
    it('should map the response data to atoms', () => {
      renderHook(() => usePluginsQuery());
      vi.waitFor(() => expect(pluginCollectionAtom.mapToAtoms).toHaveBeenCalledWith(mockPlugins));
    });

    it('should return the mapped atoms', () => {
      const { result } = renderHook(() => usePluginsQuery());
      vi.waitFor(() => expect(result.current.data).toEqual(mockPlugins));
    });

    it('should return the mapped atoms with proper Jotai store integration', () => {
      const store = createStore();
      const { result } = renderHook(() => usePluginsQuery(), {
        wrapper: ({ children }: React.PropsWithChildren) => createElement(JotaiProvider, { store }, children),
      });
      vi.waitFor(() => {
        const atomList = store.get(result.current.data!);
        expect(atomList.length === mockPlugins.length).toBe(true);
      });
    });
  });

  describe('when the API call fails', () => {
    it('should handle error when fetching plugins fails', () => {
      vi.spyOn(console, 'error').mockImplementation(vi.fn());
      const mockError = new Error('Network Error');
      vi.mocked(jtlPlatformClient.get).mockRejectedValue(mockError);

      const { result } = renderHook(() => usePluginsQuery());

      vi.waitFor(() => {
        expect(result.current.error).toEqual(mockError);
      });
    });
  });
});
