import { z } from 'zod';

const PluginInstanceStatus = z.enum(['SETUP_PENDING', 'SETUP_COMPLETED']);

type PluginInstanceStatus = z.infer<typeof PluginInstanceStatus>;

export default PluginInstanceStatus;
