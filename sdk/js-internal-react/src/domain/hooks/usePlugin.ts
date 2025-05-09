import { createUseCollectionItemHook } from '@jtl/platform-internal-react/jotai';
import { pluginCollectionAtom } from '../state';

const usePlugin = createUseCollectionItemHook(pluginCollectionAtom);

export default usePlugin;
