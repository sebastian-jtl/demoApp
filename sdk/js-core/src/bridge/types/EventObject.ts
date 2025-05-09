import { z } from 'zod';

const EventObject = z.object({
  topic: z.string(),
  payload: z.unknown(),
});

type EventObject = z.infer<typeof EventObject>;

export default EventObject;
