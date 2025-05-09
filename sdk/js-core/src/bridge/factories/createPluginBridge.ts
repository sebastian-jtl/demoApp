import PluginBridge from '../PluginBridge';
import { MessageType } from '../types';

export default function createPluginBridge(): Promise<PluginBridge> {
  return new Promise((resolve, reject) => {
    window.addEventListener('message', e => {
      if (e.data.type !== MessageType.Enum.HANDSHAKE) {
        return;
      }

      // Waiting for the host to accept us as a plugin
      if (!e.ports.length) {
        return reject();
      }

      const pluginBridge = new PluginBridge(e.ports[0]);

      // Completing the handshake
      pluginBridge.callMethod('completeHandshake').then(() => {
        console.debug('[PluginBridge] Handshake completed!');
        resolve(pluginBridge);
      });
    });
  });
}
