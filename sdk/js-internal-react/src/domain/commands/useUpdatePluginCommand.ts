import { atomWithMutation, useAtomValue } from '@jtl/platform-internal-react/jotai';
import { Plugin, PluginManifest } from '../types';
import { jtlPlatformClient, AxiosResponse } from '@jtl/platform-internal-react/axios';
import { pluginCollectionAtom } from '../state';
import { queryClient } from '@jtl/platform-internal-react/tanstack-query';

type UpdatePluginCommand = {
  pluginId: string;
  manifest: PluginManifest;
};

type UpdatePluginCommandResult = {
  plugin: Plugin;
  clientId: string;
};

const updatePluginMutationAtom = atomWithMutation(get => ({
  mutationKey: ['updatePlugin'],
  mutationFn: async (command: UpdatePluginCommand): Promise<UpdatePluginCommandResult | undefined> => {
    const response = await jtlPlatformClient.put<UpdatePluginCommand, AxiosResponse<UpdatePluginCommandResult | undefined>>(
      `/plugin-service/store/plugins/${command.pluginId}/manifest`,
      {
        manifest: command.manifest,
      },
    );

    if (response.status === 204) {
      return undefined;
    }

    if (!response.data) {
      throw new Error('No plugin data returned');
    }

    // get the instance
    const atom = pluginCollectionAtom.mapToAtom(response.data.plugin);

    // invalidate the query
    await queryClient.invalidateQueries({ queryKey: ['plugins'] });

    // return the instance
    return {
      ...response.data,
      plugin: get(atom),
    };
  },
}));

export default function useUpdatePluginCommand() {
  return useAtomValue(updatePluginMutationAtom);
}
