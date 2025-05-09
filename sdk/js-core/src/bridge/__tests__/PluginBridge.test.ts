import { describe, it, expect, vi, beforeEach } from 'vitest';
import PluginBridge from '../PluginBridge';
import IMessageLookup from '../types/IMessageLookup';
import { MessageType } from '../types';

class MockMessagePort {
  onmessage: (event: MessageEvent) => void = vi.fn();
  postMessage = vi.fn();
}

function getInternalProps(instance: PluginBridge) {
  return instance as unknown as {
    _messageLookup: Map<string, IMessageLookup<unknown>>;
    _eventListeners: Record<string, ((data: unknown) => Promise<unknown>)[]>;
    _exposedMethods: Record<string, (...params: unknown[]) => unknown>;
    sendMessage: <TBody, TResponse = void>(type: MessageType, body: TBody) => Promise<TResponse>;
  };
}
type PluginBridgeInternals = ReturnType<typeof getInternalProps>;

describe('PluginBridge', () => {
  let messagePort: MockMessagePort;
  let pluginBridge: PluginBridge;

  beforeEach(() => {
    // Reset mocks and create a fresh instance for each test
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Create mock UUID for deterministic testing
    vi.spyOn(crypto, 'randomUUID').mockReturnValue('test-uuid-1234-5678-9abc-123456789abc');

    messagePort = new MockMessagePort();
    pluginBridge = new PluginBridge(messagePort as unknown as MessagePort);
  });

  describe('constructor', () => {
    it('should initialize with a message port', () => {
      expect(messagePort.onmessage).not.toBeNull();
    });
  });

  describe('subscribe', () => {
    it('should register an event callback', async () => {
      const callback = vi.fn().mockResolvedValue('test-result');

      pluginBridge.subscribe('test-event', callback);
      const eventListeners = getInternalProps(pluginBridge)._eventListeners;
      const eventCallbacks = eventListeners['test-event'];

      expect(eventCallbacks).toContain(callback);
    });
  });

  describe('publish', () => {
    it('should call sendMessage with the correct parameters', async () => {
      const mockSendMessage = vi.fn();
      vi.spyOn(pluginBridge as unknown as PluginBridgeInternals, 'sendMessage').mockImplementation(mockSendMessage);

      await pluginBridge.publish('test-event', { foo: 'bar' });

      expect(mockSendMessage).toHaveBeenCalledWith('EVENT_TRIGGER', {
        topic: 'test-event',
        payload: { foo: 'bar' },
      });
    });
  });

  describe('exposeMethod', () => {
    it('should register a method that can be called', () => {
      const mockSendMessage = vi.fn();

      pluginBridge.exposeMethod('test-method', mockSendMessage);

      const exposedMethods = getInternalProps(pluginBridge)._exposedMethods;
      expect(exposedMethods['test-method']).toBe(mockSendMessage);
    });
  });

  describe('callMethod', () => {
    it('should call sendMessage with the correct parameters', async () => {
      const mockSendMessage = vi.fn().mockResolvedValue('result');
      vi.spyOn(pluginBridge as unknown as PluginBridgeInternals, 'sendMessage').mockImplementation(mockSendMessage);

      const result = await pluginBridge.callMethod('remote-method', 'arg1', 'arg2');

      expect(mockSendMessage).toHaveBeenCalledWith('METHOD_CALL', {
        methodName: 'remote-method',
        args: ['arg1', 'arg2'],
      });
      expect(result).toBe('result');
    });
  });

  describe('_handleMessage', () => {
    it('should handle event type METHOD_CALL_RETURN unknown message ids', async () => {
      // Create a message event with an unknown message ID
      const event = {
        data: {
          id: 'unknown-id',
          type: 'METHOD_CALL_RETURN',
          body: 'result',
        },
      };

      // Process the message
      await messagePort.onmessage(event as MessageEvent);

      // When the message ID is unknown, it should return early without doing anything
      expect(messagePort.postMessage).not.toHaveBeenCalled();
    });

    it('should handle event type METHOD_CALL_RETURN with existed message ids', async () => {
      const mockResolve = vi.fn();
      const mockReject = vi.fn();

      getInternalProps(pluginBridge)._messageLookup.set('existing-id', {
        promise: {
          resolve: mockResolve,
          reject: mockReject,
        },
      });

      const event = {
        data: {
          id: 'existing-id',
          type: 'METHOD_CALL_RETURN',
          body: 'test-result',
        },
      };

      await messagePort.onmessage(event as MessageEvent);

      expect(mockResolve).toHaveBeenCalledWith('test-result');
      expect(getInternalProps(pluginBridge)._messageLookup.has('existing-id')).toBe(false);
    });

    it('should handle event type METHOD_CALL_ERROR with existed message ids', async () => {
      const mockResolve = vi.fn();
      const mockReject = vi.fn();

      getInternalProps(pluginBridge)._messageLookup.set('error-id', {
        promise: {
          resolve: mockResolve,
          reject: mockReject,
        },
      });

      const event = {
        data: {
          id: 'error-id',
          type: 'METHOD_CALL_ERROR',
          body: 'test-error',
        },
      };

      await messagePort.onmessage(event as MessageEvent);

      expect(mockReject).toHaveBeenCalledWith('test-error');
      expect(getInternalProps(pluginBridge)._messageLookup.has('error-id')).toBe(false);
    });

    it('should handle invalid messages', async () => {
      // Mock console.error to prevent test noise
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Create a message that still passes Zod validation but with an ID that doesn't exist
      // in the lookup to test error handling
      const validButUnknownEvent = {
        data: {
          id: 'unknown-id',
          type: 'METHOD_CALL_ERROR',
          body: { error: 'Some error' },
        },
      };

      // This should not throw an error even with unknown ID
      await messagePort.onmessage(validButUnknownEvent as MessageEvent);

      // Restore console.error for other tests
      consoleErrorSpy.mockRestore();

      // Validate that no message was sent in response (early return)
      expect(messagePort.postMessage).not.toHaveBeenCalled();
    });

    it('should handle event confirmations for unknown message ids', async () => {
      // Mock console.error to prevent test noise during the test
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Create an event confirmation message with an ID that doesn't exist
      // in the message lookup
      const validButUnknownEvent = {
        data: {
          id: 'unknown-id',
          type: 'EVENT_TRIGGER_CONFIRMATION',
          body: { error: 'Some error' },
        },
      };

      // Process the message - should gracefully handle unknown ID
      await messagePort.onmessage(validButUnknownEvent as MessageEvent);

      // Restore console.error for subsequent tests
      consoleErrorSpy.mockRestore();

      // Validate that no action was taken for an unknown message ID
      expect(messagePort.postMessage).not.toHaveBeenCalled();
    });

    it('should handle METHOD_CALL and execute the method', async () => {
      // Register a test method
      const testMethod = vi.fn().mockReturnValue('test-result');
      getInternalProps(pluginBridge)._exposedMethods['test-method'] = testMethod;

      // Create message to call the method
      const event = {
        data: {
          id: 'call-id',
          type: 'METHOD_CALL',
          body: {
            methodName: 'test-method',
            args: ['arg1', 'arg2'],
          },
        },
      };

      // Process the message
      await messagePort.onmessage(event as MessageEvent);

      // Verify the method was called with args
      expect(testMethod).toHaveBeenCalledWith('arg1', 'arg2');

      // Verify response was sent
      expect(messagePort.postMessage).toHaveBeenCalledWith({
        id: 'call-id',
        type: 'METHOD_CALL_RETURN',
        body: 'test-result',
      });
    });

    it('should handle METHOD_CALL for non-existent methods', async () => {
      // Mock console.error to prevent test noise
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Create message to call a non-existent method
      const event = {
        data: {
          id: 'call-id',
          type: 'METHOD_CALL',
          body: {
            methodName: 'non-existent-method',
            args: [],
          },
        },
      };

      // Process the message
      await messagePort.onmessage(event as MessageEvent);

      // Verify error was logged
      expect(consoleError).toHaveBeenCalledWith('Method non-existent-method is not exposed');

      // Verify no response was sent
      expect(messagePort.postMessage).not.toHaveBeenCalled();

      // Clean up mock
      consoleError.mockRestore();
    });

    it('should handle METHOD_CALL with async methods', async () => {
      // Register an async test method
      const testMethod = vi.fn().mockResolvedValue('async-result');
      getInternalProps(pluginBridge)._exposedMethods['async-method'] = testMethod;

      // Create message to call the method
      const event = {
        data: {
          id: 'call-id',
          type: 'METHOD_CALL',
          body: {
            methodName: 'async-method',
            args: ['arg1', 'arg2'],
          },
        },
      };

      // Process the message
      await messagePort.onmessage(event as MessageEvent);

      // Verify the method was called with args
      expect(testMethod).toHaveBeenCalledWith('arg1', 'arg2');

      // Verify response was sent with resolved value
      expect(messagePort.postMessage).toHaveBeenCalledWith({
        id: 'call-id',
        type: 'METHOD_CALL_RETURN',
        body: 'async-result',
      });
    });

    it('should handle EVENT_TRIGGER_CONFIRMATION with existing message id', async () => {
      const mockResolve = vi.fn();
      const mockReject = vi.fn();

      // Set up a message in the lookup
      getInternalProps(pluginBridge)._messageLookup.set('event-id', {
        promise: {
          resolve: mockResolve,
          reject: mockReject,
        },
      });

      // Create a message event
      const event = {
        data: {
          id: 'event-id',
          type: 'EVENT_TRIGGER_CONFIRMATION',
        },
      };

      // Process the message
      await messagePort.onmessage(event as MessageEvent);

      // Verify the promise was resolved
      expect(mockResolve).toHaveBeenCalled();

      // Verify the message was removed from the lookup
      expect(getInternalProps(pluginBridge)._messageLookup.has('event-id')).toBe(false);
    });

    it('should handle EVENT_TRIGGER and invoke listeners', async () => {
      // Create event listeners
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      // Register listeners
      getInternalProps(pluginBridge)._eventListeners['test-topic'] = [listener1, listener2];

      // Create message event
      const event = {
        data: {
          id: 'event-id',
          type: 'EVENT_TRIGGER',
          body: {
            topic: 'test-topic',
            payload: 'test-payload',
          },
        },
      };

      // Process the message
      await messagePort.onmessage(event as MessageEvent);

      // Verify listeners were called
      expect(listener1).toHaveBeenCalledWith('test-payload');
      expect(listener2).toHaveBeenCalledWith('test-payload');

      // Verify confirmation was sent
      expect(messagePort.postMessage).toHaveBeenCalledWith({
        id: 'event-id',
        type: 'EVENT_TRIGGER_CONFIRMATION',
      });
    });

    it('should handle default case for unknown message types', async () => {
      // Create message with unknown type (but valid in the Zod schema)
      const event = {
        data: {
          id: 'test-id',
          type: 'HANDSHAKE', // This is in the schema but not explicitly handled in switch
          body: {},
        },
      };

      // Process the message
      await messagePort.onmessage(event as MessageEvent);

      // Verify that nothing happened - the default case is just a no-op
      expect(messagePort.postMessage).not.toHaveBeenCalled();
    });
  });

  describe('sendMessage', () => {
    it('should send a message and set up promise resolution', async () => {
      const sendPromise = (pluginBridge as unknown as PluginBridgeInternals).sendMessage('EVENT_TRIGGER', { data: 'test' });

      // Verify message was sent
      expect(messagePort.postMessage).toHaveBeenCalledWith({
        id: 'test-uuid-1234-5678-9abc-123456789abc',
        type: 'EVENT_TRIGGER',
        body: { data: 'test' },
      });

      // Verify lookup was set
      const lookup = getInternalProps(pluginBridge)._messageLookup.get('test-uuid-1234-5678-9abc-123456789abc');
      expect(lookup).toBeDefined();

      // Simulate response by calling the resolve function
      lookup?.promise.resolve('response-data');

      // Verify promise resolves with the right value
      const result = await sendPromise;
      expect(result).toBe('response-data');
    });

    it('should reject the promise after timeout', async () => {
      // For this test, we WANT the timeout to trigger immediately
      vi.spyOn(global, 'setTimeout').mockImplementation(callback => {
        if (typeof callback === 'function') {
          callback();
        }
        return 1 as unknown as ReturnType<typeof setTimeout>;
      });

      const sendPromisePromise = getInternalProps(pluginBridge).sendMessage('EVENT_TRIGGER', { data: 'test' });

      // The timeout mock will trigger rejection immediately
      await expect(sendPromisePromise).rejects.toBe('Plugin timeout');
    });
  });
});
