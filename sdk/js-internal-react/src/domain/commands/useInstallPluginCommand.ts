import { atomWithMutation, useAtomValue } from '@jtl/platform-internal-react/jotai';
import { PluginInstance } from '../types';
import { jtlPlatformClient, AxiosResponse } from '@jtl/platform-internal-react/axios';
import { pluginInstanceCollectionAtom } from '../state';
import { queryClient } from '@jtl/platform-internal-react/tanstack-query';

type InstallPluginCommand = {
  pluginId: string;
};

const installPluginMutationAtom = atomWithMutation(get => ({
  mutationKey: ['installPlugin'],
  mutationFn: async (command: InstallPluginCommand): Promise<PluginInstance> => {
    const response = await jtlPlatformClient.post<InstallPluginCommand, AxiosResponse<PluginInstance>>(
      `/plugin-service/store/plugins/${command.pluginId}/install`,
      {},
    );

    // create the instance
    const atom = pluginInstanceCollectionAtom.mapToAtom(response.data);

    // invalidate the query
    await queryClient.invalidateQueries({ queryKey: ['plugin-instances'] });

    // return the instance
    return get(atom);
  },
}));

export default function useInstallPluginCommand() {
  return useAtomValue(installPluginMutationAtom);
}
