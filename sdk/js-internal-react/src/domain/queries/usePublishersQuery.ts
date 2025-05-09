import { Publisher } from '@/domain/types';
import { useMemo } from 'react';
import { atomWithQuery, useAtomValue, atom } from '@jtl/platform-internal-react/jotai';
import { jtlPlatformClient } from '@jtl/platform-internal-react/axios';
import { queryClient } from '@jtl/platform-internal-react/tanstack-query';
import { publisherCollectionAtom } from '../state';

type PublishersQuery = {
  onlyPublishersOfTenant?: boolean;
};

export default function usePublishersQuery(query?: PublishersQuery) {
  const isTenantIdAvailable = !!jtlPlatformClient.environment?.tenantId;

  const queryAtom = useMemo(() => {
    return atomWithQuery(
      () => {
        return {
          queryKey: ['publishers', query?.onlyPublishersOfTenant, isTenantIdAvailable],
          queryFn: async () => {
            try {
              const queryParams = new URLSearchParams();
              if (query?.onlyPublishersOfTenant) {
                queryParams.append('only-publishers-of-tenant', String(query.onlyPublishersOfTenant));
              }
              const response = await jtlPlatformClient.get<Publisher[]>(`plugin-service/publishers?${queryParams}`);
              publisherCollectionAtom.mapToAtoms(response.data);
              return atom(get =>
                response.data
                  .map(entity => {
                    return get(publisherCollectionAtom)[entity.id];
                  })
                  .filter(Boolean),
              );
            } catch (error) {
              console.error('Error fetching publishers', error);
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
