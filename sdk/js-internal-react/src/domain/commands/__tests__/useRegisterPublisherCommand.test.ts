import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { jtlPlatformClient } from '@jtl/platform-internal-react/axios';
import { Publisher } from '../../types';
import useRegisterPublisherCommand from '../useRegisterPublisherCommand';
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

describe('useRegisterPublisherCommand', () => {
  // Mock publisher data
  const mockPublisherCommand = {
    name: 'Test Publisher',
    legalAgreementAccepted: true,
  };

  const mockPublisher: Publisher = {
    id: 'test-publisher-id',
    name: 'Test Publisher',
    state: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockResponse = {
    data: mockPublisher,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls the API with the correct parameters', async () => {
    vi.mocked(jtlPlatformClient.post).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useRegisterPublisherCommand());

    act(() => {
      result.current.mutate(mockPublisherCommand);
    });

    await vi.waitFor(() => {
      expect(jtlPlatformClient.post).toHaveBeenCalledWith('/plugin-service/publishers/register', mockPublisherCommand);
    });
  });

  it('invalidates query on success', async () => {
    vi.mocked(jtlPlatformClient.post).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useRegisterPublisherCommand());

    const onSuccess = vi.fn();

    act(() => {
      result.current.mutate(mockPublisherCommand, { onSuccess });
    });

    await vi.waitFor(() => {
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['publishers'] });
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('calls onError handler when API call fails', async () => {
    const mockError = new Error('Network Error');
    vi.mocked(jtlPlatformClient.post).mockRejectedValue(mockError);

    const { result } = renderHook(() => useRegisterPublisherCommand());
    const onErrorMock = vi.fn();

    act(() => {
      result.current.mutate(mockPublisherCommand, { onError: onErrorMock });
    });

    await vi.waitFor(() => {
      expect(onErrorMock).toHaveBeenCalled();
      const [[error, variables]] = onErrorMock.mock.calls;
      expect(error).toEqual(mockError);
      expect(variables).toEqual(mockPublisherCommand);
    });
  });
});
