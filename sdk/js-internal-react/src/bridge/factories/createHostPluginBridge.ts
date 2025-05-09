import { MessageType } from '@jtl/platform-plugins-core';
import HostPluginBridge from '../HostPluginBridge';

/**
 * Creates a new HostPluginBridge
 * @param pluginIFrame The plugin iFrame element
 * @param pluginRequestHandler The handler for the plugin requests
 * @returns A fully operational HostPluginBridge
 */
export default function createHostPluginBridge(pluginIFrame: HTMLIFrameElement): Promise<HostPluginBridge> {
  return new Promise(resolve => {
    const messageChannel = new MessageChannel();
    const hostPluginBridge = new HostPluginBridge(messageChannel.port1);

    // set interval to try handshake every 100ms
    const handshakeInterval = setInterval(() => {
      if (!hostPluginBridge.isMethodExposed('completeHandshake')) {
        // expose the completeHandshake method to the plugin
        hostPluginBridge.exposeMethod('completeHandshake', () => {
          console.debug('[HostPluginBridge] Handshake completed!');
          clearInterval(handshakeInterval);
          resolve(hostPluginBridge);
        });
      }

      console.debug('[HostPluginBridge] Waiting for handshake...');
      if (pluginIFrame.contentWindow) {
        console.debug('[HostPluginBridge] Executing handshake...');
        pluginIFrame.contentWindow.postMessage(
          {
            type: MessageType.Enum.HANDSHAKE,
          },
          '*',
          [messageChannel.port2],
        );
      }
    }, 100);
  });
}
