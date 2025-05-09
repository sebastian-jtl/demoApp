import { z } from 'zod';

const PluginSubmissionState = z.enum(['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED']);

type PluginSubmissionState = z.infer<typeof PluginSubmissionState>;

export default PluginSubmissionState;
