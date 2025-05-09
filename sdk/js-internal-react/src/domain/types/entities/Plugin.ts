import { EntityBase } from '@jtl/platform-internal-react/jotai';
import { z } from 'zod';
import PluginVersion from './PluginVersion';

const Plugin = EntityBase.extend({
  name: z.string(),
  clientId: z.string(),
  activeVersion: PluginVersion,
  publisherId: z.string(),
});

type Plugin = z.infer<typeof Plugin>;

export default Plugin;
