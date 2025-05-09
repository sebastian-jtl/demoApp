import { createEntityCollectionAtom } from '@jtl/platform-internal-react/jotai';
import { Publisher } from '../types';

const publisherCollectionAtom = createEntityCollectionAtom<Publisher>();

export default publisherCollectionAtom;
