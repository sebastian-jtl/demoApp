import { EntityBase } from '@jtl/platform-internal-react/jotai';
import { z } from 'zod';
import { PublisherState } from '../enums';

const Publisher = EntityBase.extend({
  name: z.string(),
  state: PublisherState,
});

type Publisher = z.infer<typeof Publisher>;

export default Publisher;
