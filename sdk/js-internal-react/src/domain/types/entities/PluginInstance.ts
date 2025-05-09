import { z } from 'zod';
import { EntityBase } from '@jtl/platform-internal-react/jotai';
import { PluginInstanceStatus } from '../enums';
import PluginManifest from '../value-objects/PluginManifest';

const PluginInstance = EntityBase.extend({
  status: PluginInstanceStatus,
  scopes: z.array(z.string()),
  features: z.array(z.string()),
  manifest: PluginManifest,
});

type PluginInstance = z.infer<typeof PluginInstance>;

export default PluginInstance;
