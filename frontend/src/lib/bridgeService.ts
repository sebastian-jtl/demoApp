import { createPluginBridge, PluginBridge } from '@jtl/platform-plugins-core';

let pluginBridge: PluginBridge | null = null;
let initializing: Promise<PluginBridge> | null = null;

export async function initBridge(): Promise<PluginBridge> {
  if (pluginBridge) return pluginBridge;

  if (!initializing) {
    initializing = createPluginBridge()
      .then((bridge) => {
        pluginBridge = bridge;
        return bridge;
      })
      .finally(() => {
        initializing = null;
      });
  }

  return initializing;
}

export const getBridge = (): PluginBridge | null => {
  return pluginBridge;
};

export const getSessionToken = async () : Promise<string> => {
  return await pluginBridge?.callMethod('getSessionToken') as string;
}

export const completeSetup = async () => {
  await pluginBridge?.callMethod('setupCompleted');
}