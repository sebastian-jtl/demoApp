import { describe, it, expect, vi, beforeEach } from 'vitest';
import HostPluginBridge from '../HostPluginBridge';
import { jtlPlatformClient } from '@jtl/platform-internal-react/axios';

vi.mock('@jtl/platform-internal-react/axios', () => ({
  jtlPlatformClient: {
    get: vi.fn(),
  },
}));

class MockMessagePort {
  onmessage: (event: MessageEvent) => void = vi.fn();
  postMessage = vi.fn();
}

// Helper function to access private properties
function getInternalProps(instance: HostPluginBridge) {
  return instance as unknown as {
    _messageLookup: Map<string, unknown>;
    _eventListeners: Record<string, ((data: unknown) => Promise<unknown>)[]>;
    _exposedMethods: Record<string, (...params: unknown[]) => unknown>;
    sendMessage: <TBody, TResponse = void>(type: string, body: TBody) => Promise<TResponse>;
  };
}

describe('HostPluginBridge', () => {
  let messagePort: MockMessagePort;
  let hostPluginBridge: HostPluginBridge;

  beforeEach(() => {
    vi.clearAllMocks();
    messagePort = new MockMessagePort();
    hostPluginBridge = new HostPluginBridge(messagePort as unknown as MessagePort);
  });

  describe('constructor', () => {
    it('should initialize with a message port', () => {
      expect(messagePort.onmessage).not.toBeNull();
    });

    it('should expose getSessionToken method', () => {
      const exposedMethods = getInternalProps(hostPluginBridge)._exposedMethods;
      expect(exposedMethods['getSessionToken']).toBeDefined();
      expect(typeof exposedMethods['getSessionToken']).toBe('function');
    });
  });

  describe('getSessionToken', () => {
    it('should call the API and return session token on success', async () => {
      // Mock successful API response
      const mockResponse = {
        status: 200,
        data: 'test-session-token',
      };
      vi.mocked(jtlPlatformClient.get).mockResolvedValue(mockResponse);

      // Get the exposed method
      const exposedMethods = getInternalProps(hostPluginBridge)._exposedMethods;
      const getSessionToken = exposedMethods['getSessionToken'] as () => Promise<string>;

      // Call the method
      const result = await getSessionToken();

      // Verify API was called correctly
      expect(jtlPlatformClient.get).toHaveBeenCalledWith('account/identity/session-token');
      expect(result).toBe('test-session-token');
    });

    it('should throw an error if API returns non-200 status', async () => {
      // Mock failed API response
      const mockResponse = {
        status: 401,
        data: null,
      };
      vi.mocked(jtlPlatformClient.get).mockResolvedValue(mockResponse);

      // Get the exposed method
      const exposedMethods = getInternalProps(hostPluginBridge)._exposedMethods;
      const getSessionToken = exposedMethods['getSessionToken'] as () => Promise<string>;

      // Call the method and expect error
      await expect(getSessionToken()).rejects.toThrow('failed to get session token: 401');
      expect(jtlPlatformClient.get).toHaveBeenCalledWith('account/identity/session-token');
    });

    it('should propagate API errors', async () => {
      // Mock API error
      const mockError = new Error('Network error');
      vi.mocked(jtlPlatformClient.get).mockRejectedValue(mockError);

      // Get the exposed method
      const exposedMethods = getInternalProps(hostPluginBridge)._exposedMethods;
      const getSessionToken = exposedMethods['getSessionToken'] as () => Promise<string>;

      // Call the method and expect error
      await expect(getSessionToken()).rejects.toThrow('Network error');
      expect(jtlPlatformClient.get).toHaveBeenCalledWith('account/identity/session-token');
    });
  });
});
