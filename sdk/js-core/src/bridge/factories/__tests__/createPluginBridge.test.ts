import { describe, it, expect, vi, beforeEach } from 'vitest';
import createPluginBridge from '../createPluginBridge';
import { MessageType } from '../../types';
import PluginBridge from '@/bridge/PluginBridge';

describe('createPluginBridge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should resolve with PluginBridge instance when handshake is received with ports', async () => {
    vi.spyOn(PluginBridge.prototype, 'callMethod').mockResolvedValue(true);

    const mockResolve = vi.fn();
    createPluginBridge().then(mockResolve);
    const channel = new MessageChannel();
    const event = new MessageEvent('message', {
      data: {
        type: MessageType.Enum.HANDSHAKE,
      },
      ports: [channel.port2],
    });
    window.dispatchEvent(event);

    await vi.waitFor(() => {
      expect(mockResolve).toHaveBeenCalled();

      const [bridge] = mockResolve.mock.calls[0];
      expect(bridge).toBeInstanceOf(PluginBridge);
    });
  });

  it('should ignores non-handshake messages', async () => {
    const mockResolve = vi.fn();
    const mockReject = vi.fn();
    createPluginBridge().then(mockResolve).catch(mockReject);

    const channel = new MessageChannel();
    const event = new MessageEvent('message', {
      data: {
        type: MessageType.Enum.EVENT_TRIGGER,
      },
      ports: [channel.port2],
    });
    window.dispatchEvent(event);

    expect(mockResolve).not.toHaveBeenCalled();
    expect(mockReject).not.toHaveBeenCalled();
  });

  it('should reject when handshake is received without ports', async () => {
    const mockReject = vi.fn();
    createPluginBridge().catch(mockReject);

    const event = new MessageEvent('message', {
      data: {
        type: MessageType.Enum.HANDSHAKE,
      },
      ports: [],
    });
    window.dispatchEvent(event);

    await vi.waitFor(() => expect(mockReject).toHaveBeenCalled());
  });
});
