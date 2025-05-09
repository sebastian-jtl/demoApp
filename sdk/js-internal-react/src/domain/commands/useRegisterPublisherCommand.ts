import { atomWithMutation, useAtomValue } from '@jtl/platform-internal-react/jotai';
import { Publisher } from '../types';
import { jtlPlatformClient, AxiosResponse } from '@jtl/platform-internal-react/axios';
import { publisherCollectionAtom } from '../state';
import { queryClient } from '@jtl/platform-internal-react/tanstack-query';

type RegisterPublisherCommand = {
  name: string;
  legalAgreementAccepted: boolean;
};

const registerPublisherMutationAtom = atomWithMutation(get => ({
  mutationKey: ['registerPublisher'],
  mutationFn: async (command: RegisterPublisherCommand): Promise<Publisher> => {
    const response = await jtlPlatformClient.post<RegisterPublisherCommand, AxiosResponse<Publisher>>(`/plugin-service/publishers/register`, command);

    // create the instance
    const atom = publisherCollectionAtom.mapToAtom(response.data);

    // invalidate the query
    await queryClient.invalidateQueries({ queryKey: ['publishers'] });

    // return the instance
    return get(atom);
  },
}));

export default function useRegisterPublisherCommand() {
  return useAtomValue(registerPublisherMutationAtom);
}
