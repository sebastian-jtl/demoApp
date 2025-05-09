import { PluginCapability, PluginInstance } from '@/domain/types';
import { useMemo } from 'react';
import { atomWithQuery, useAtomValue, atom } from '@jtl/platform-internal-react/jotai';
import { jtlPlatformClient } from '@jtl/platform-internal-react/axios';
import { queryClient } from '@jtl/platform-internal-react/tanstack-query';
import { pluginInstanceCollectionAtom } from '../state';

export default function usePluginInstancesQuery(capability: PluginCapability) {
  const isTenantIdAvailable = !!jtlPlatformClient.environment?.tenantId;

  const queryAtom = useMemo(() => {
    return atomWithQuery(
      () => {
        return {
          queryKey: ['plugin-instances', capability],
          queryFn: async () => {
            try {
              const response = await jtlPlatformClient.get<PluginInstance[]>(`plugin-service/plugins?capability=${capability}`);
              pluginInstanceCollectionAtom.mapToAtoms(response.data);
              return atom(get =>
                response.data
                  .map(entity => {
                    return get(pluginInstanceCollectionAtom)[entity.id];
                  })
                  .filter(Boolean),
              );
            } catch (error) {
              console.error('Error fetching plugin instances', error);
              throw error;
            }
          },
          enabled: isTenantIdAvailable,
        };
      },
      () => {
        // specify the queryClient to enable TanStack-DevTools support
        return queryClient;
      },
    );
  }, [capability, isTenantIdAvailable]);

  return useAtomValue(queryAtom);
}
