import { createEntityCollectionAtom } from '@jtl/platform-internal-react/jotai';
import { PluginInstance } from '../types';

const pluginInstanceCollectionAtom = createEntityCollectionAtom<PluginInstance>();

export default pluginInstanceCollectionAtom;
