import { Plugin, PluginSubmissionState } from '@/domain/types';
import { useMemo } from 'react';
import { atomWithQuery, useAtomValue, atom } from '@jtl/platform-internal-react/jotai';
import { jtlPlatformClient } from '@jtl/platform-internal-react/axios';
import { queryClient } from '@jtl/platform-internal-react/tanstack-query';
import { pluginCollectionAtom } from '../state';

export type PluginsQuery = {
  submissionState?: PluginSubmissionState;
  publisherId?: string;
  onlyPluginsOfTenant?: boolean;
};

export default function usePluginsQuery(query?: PluginsQuery) {
  const isTenantIdAvailable = !!jtlPlatformClient.environment?.tenantId;

  const queryAtom = useMemo(() => {
    return atomWithQuery(
      () => {
        return {
          queryKey: ['plugins', query?.publisherId, query?.submissionState, query?.onlyPluginsOfTenant, isTenantIdAvailable],
          queryFn: async () => {
            try {
              const queryParams = new URLSearchParams();
              if (query?.submissionState) {
                queryParams.append('submission-state', query.submissionState);
              }
              if (query?.publisherId) {
                queryParams.append('publisher-id', query.publisherId);
              }
              if (query?.onlyPluginsOfTenant) {
                queryParams.append('only-plugins-of-tenant', String(query.onlyPluginsOfTenant));
              }
              const response = await jtlPlatformClient.get<Plugin[]>(`plugin-service/store/plugins?${queryParams}`);
              pluginCollectionAtom.mapToAtoms(response.data);
              return atom(get =>
                response.data
                  .map(entity => {
                    return get(pluginCollectionAtom)[entity.id];
                  })
                  .filter(Boolean),
              );
            } catch (error) {
              console.error('Error fetching plugins', error);
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
  }, [query, isTenantIdAvailable]);

  return useAtomValue(queryAtom);
}
