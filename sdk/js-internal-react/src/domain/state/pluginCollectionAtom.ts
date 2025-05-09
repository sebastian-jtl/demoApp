import { createEntityCollectionAtom } from '@jtl/platform-internal-react/jotai';
import { Plugin } from '../types';

const pluginCollectionAtom = createEntityCollectionAtom<Plugin>();

export default pluginCollectionAtom;
