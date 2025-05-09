import { jtlPlatformClient } from '@jtl/platform-internal-react/axios';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import usePublishersQuery from '../usePublishersQuery';
import { createStore, Provider as JotaiProvider } from '@jtl/platform-internal-react/jotai';
import { createElement } from 'react';
import { publisherCollectionAtom } from '../../state';
import { Publisher } from '../../types';

vi.mock('@jtl/platform-internal-react/axios', () => ({
  jtlPlatformClient: {
    get: vi.fn(),
    environment: {
      tenantId: 'tenant-1',
    },
  },
}));

vi.mock('../state', () => ({
  publisherCollectionAtom: {
    mapToAtoms: vi.fn(),
  },
}));

describe('usePublishersQuery', () => {
  const mockOnlyPublishersOfTenant = true;

  const mockPublishers: Publisher[] = [
    {
      id: 'publisher-1',
      name: 'Test Publisher 1',
      state: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'publisher-2',
      name: 'Test Publisher 2',
      state: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(jtlPlatformClient.get).mockResolvedValue({ data: mockPublishers });
    vi.mocked(jtlPlatformClient.environment).tenantId = 'tenant-1';
  });

  it('should not be called when tenantId is not available', () => {
    vi.mocked(jtlPlatformClient.environment).tenantId = undefined;
    const { result } = renderHook(() => usePublishersQuery());

    expect(result.current.fetchStatus).toBe('idle');
    expect(result.current.data).toBeUndefined();
    expect(jtlPlatformClient.get).not.toHaveBeenCalled();
  });

  it('should call the API with no query parameters when no query is provided', () => {
    renderHook(() => usePublishersQuery());
    expect(jtlPlatformClient.get).toHaveBeenCalledWith('plugin-service/publishers?');
  });

  it('should call the API with the correct query parameters when onlyPublishersOfTenant is provided', () => {
    const query = { onlyPublishersOfTenant: mockOnlyPublishersOfTenant };
    renderHook(() => usePublishersQuery(query));
    expect(jtlPlatformClient.get).toHaveBeenCalledWith(`plugin-service/publishers?only-publishers-of-tenant=${mockOnlyPublishersOfTenant}`);
  });

  describe('when the API call is successful', () => {
    it('should map the response data to atoms', () => {
      renderHook(() => usePublishersQuery());
      vi.waitFor(() => expect(publisherCollectionAtom.mapToAtoms).toHaveBeenCalledWith(mockPublishers));
    });

    it('should return the mapped atoms', () => {
      const { result } = renderHook(() => usePublishersQuery());
      vi.waitFor(() => expect(result.current.data).toEqual(mockPublishers));
    });

    it('should return the mapped publishers as atoms', () => {
      const store = createStore();
      const { result } = renderHook(() => usePublishersQuery(), {
        wrapper: ({ children }: React.PropsWithChildren) => createElement(JotaiProvider, { store }, children),
      });
      vi.waitFor(() => {
        const atomList = store.get(result.current.data!);
        expect(atomList.length === mockPublishers.length).toBe(true);
      });
    });
  });

  describe('when the API call fails', () => {
    it('should handle error when fetching publishers fails', () => {
      vi.spyOn(console, 'error').mockImplementation(vi.fn());
      const mockError = new Error('Network Error');
      vi.mocked(jtlPlatformClient.get).mockRejectedValue(mockError);

      const { result } = renderHook(() => usePublishersQuery());

      vi.waitFor(() => {
        expect(result.current.error).toEqual(mockError);
      });
    });
  });
});
