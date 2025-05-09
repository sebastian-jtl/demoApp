import { z } from 'zod';

const PublisherState = z.enum(['PENDING', 'ACTIVE', 'REJECTED', 'SUSPENDED']);

type PublisherState = z.infer<typeof PublisherState>;

export default PublisherState;
