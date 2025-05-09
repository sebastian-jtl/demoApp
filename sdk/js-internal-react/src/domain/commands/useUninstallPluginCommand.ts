import { atomWithMutation, useAtomValue } from '@jtl/platform-internal-react/jotai';
import { jtlPlatformClient, AxiosResponse } from '@jtl/platform-internal-react/axios';
import { pluginInstanceCollectionAtom } from '../state';

type UninstallPluginCommand = {
  pluginInstanceId: string;
};

const uninstallPluginMutationAtom = atomWithMutation(() => ({
  mutationKey: ['installPlugin'],
  mutationFn: async (command: UninstallPluginCommand): Promise<void> => {
    await jtlPlatformClient.delete<AxiosResponse<void>>(`/plugin-service/plugins/${command.pluginInstanceId}`);

    // delete the instance
    pluginInstanceCollectionAtom.deleteAtom(command.pluginInstanceId);
  },
}));

export default function useUninstallPluginCommand() {
  return useAtomValue(uninstallPluginMutationAtom);
}
