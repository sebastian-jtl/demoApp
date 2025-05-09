import { jtlPlatformClient, AxiosResponse } from '@jtl/platform-internal-react/axios';
import { atomWithMutation, useAtomValue } from '@jtl/platform-internal-react/jotai';
import { queryClient } from '@jtl/platform-internal-react/tanstack-query';
import { PluginManifest, Plugin } from '../types';
import { pluginCollectionAtom } from '../state';

type CreatePluginCommand = {
  manifest: PluginManifest;
};

type CreatePluginCommandResult = {
  plugin: Plugin;
  clientId: string;
  clientSecret: string;
};

const createPluginMutationAtom = atomWithMutation(get => ({
  mutationKey: ['createPlugin'],
  mutationFn: async (command: CreatePluginCommand): Promise<CreatePluginCommandResult> => {
    const response = await jtlPlatformClient.post<CreatePluginCommand, AxiosResponse<CreatePluginCommandResult>>(
      `/plugin-service/store/plugins`,
      command,
    );

    // create the instance
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

export default function useCreatePluginCommand() {
  return useAtomValue(createPluginMutationAtom);
}
