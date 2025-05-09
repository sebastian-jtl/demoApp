import { useMemo } from 'react';
import { jtlStore, useAtomValueOptional } from '@jtl/platform-internal-react/jotai';
import { IApplication } from '@jtl/platform-internal-react';
import { usePluginInstancesQuery, usePluginsQuery } from '../queries';
import { PluginInstanceStatus, PluginSubmissionState } from '../types';

const pluginsQuery = {
  submissionState: PluginSubmissionState.Enum.APPROVED,
};

// TODO: Write a test for this hook
export default function useActiveApps() {
  const pluginInstancesQueryResult = usePluginInstancesQuery('hub');
  const pluginInstancesEntityAtom = pluginInstancesQueryResult.data;
  const pluginInstancesAtom = useAtomValueOptional(pluginInstancesEntityAtom);

  const pluginsQueryResult = usePluginsQuery(pluginsQuery);
  const pluginsEntityAtom = pluginsQueryResult.data;
  const pluginsAtom = useAtomValueOptional(pluginsEntityAtom);

  const plugins = useMemo(() => {
    return pluginsAtom?.map(pluginAtom => jtlStore.get(pluginAtom)) || [];
  }, [pluginsAtom]);

  const pluginInstances = useMemo(() => {
    return pluginInstancesAtom?.map(instanceAtom => jtlStore.get(instanceAtom)) || [];
  }, [pluginInstancesAtom]);

  /**
   * Active apps are those that are installed and have a status of SETUP_COMPLETED.
   */
  const activeApps = useMemo(() => {
    return plugins
      .map(plugin => {
        const pluginInstance = pluginInstances.find(pluginInstance => pluginInstance.id === plugin.id);

        if (pluginInstance && pluginInstance.status === PluginInstanceStatus.Enum.SETUP_COMPLETED) {
          return {
            name: plugin.name,
            imageUrl: plugin.activeVersion.manifest.icon.light,
            redirectUrl: pluginInstance.manifest?.capabilities?.hub?.appLauncher?.redirectUrl,
            isActive: true,
          } as IApplication;
        }

        return null;
      })
      .filter((app): app is IApplication => app !== null);
  }, [pluginInstances, plugins]);

  return { activeApps };
}
