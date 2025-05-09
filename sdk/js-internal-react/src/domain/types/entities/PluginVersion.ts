import { EntityBase } from '@jtl/platform-internal-react/jotai';
import { z } from 'zod';
import PluginManifest from '../value-objects/PluginManifest';
import { PluginSubmissionState } from '../enums';

const PluginVersion = EntityBase.extend({
  manifest: PluginManifest,
  submissionState: PluginSubmissionState,
});

type PluginVersion = z.infer<typeof PluginVersion>;

export default PluginVersion;
