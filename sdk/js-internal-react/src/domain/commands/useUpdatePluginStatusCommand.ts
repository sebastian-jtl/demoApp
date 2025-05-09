import { atomWithMutation, useAtomValue } from '@jtl/platform-internal-react/jotai';
import { jtlPlatformClient, AxiosResponse } from '@jtl/platform-internal-react/axios';
import { pluginInstanceCollectionAtom } from '../state';
import { PluginInstance, PluginInstanceStatus } from '../types';

type UseUpdatePluginStatusCommand = {
  id: string;
  status: PluginInstanceStatus;
};

const useUpdatePluginStatusMutationAtom = atomWithMutation(get => ({
  mutationKey: ['updatePluginStatus'],
  mutationFn: async (command: UseUpdatePluginStatusCommand): Promise<PluginInstance> => {
    const response = await jtlPlatformClient.put<UseUpdatePluginStatusCommand, AxiosResponse<PluginInstance>>(
      `/plugin-service/plugins/${command.id}/status`,
      {
        status: command.status,
      },
    );

    // update the instance
    const pluginInstanceAtom = pluginInstanceCollectionAtom.mapToAtom(response.data);

    return get(pluginInstanceAtom);
  },
}));

export default function useUpdatePluginStatusCommand() {
  return useAtomValue(useUpdatePluginStatusMutationAtom);
}
