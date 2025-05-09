import { createUseCollectionItemHook } from '@jtl/platform-internal-react/jotai';
import { pluginInstanceCollectionAtom } from '../state';

const usePluginInstance = createUseCollectionItemHook(pluginInstanceCollectionAtom);

export default usePluginInstance;
