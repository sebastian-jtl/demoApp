import { jtlPlatformClient } from '@jtl/platform-internal-react/axios';
import { PluginBridge } from '@jtl/platform-plugins-core';

export default class HostPluginBridge extends PluginBridge {
  constructor(messagePort: MessagePort) {
    super(messagePort);

    this.exposeMethod('getSessionToken', async () => {
      const response = await jtlPlatformClient.get<string>('account/identity/session-token');

      if (response.status !== 200) {
        throw new Error(`failed to get session token: ${response.status}`);
      }

      return response.data;
    });
  }
}
