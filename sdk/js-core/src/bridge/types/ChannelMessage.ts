import { z } from 'zod';
import MessageType from './MessageType';

const ChannelMessage = z.object({
  id: z.string(),
  type: MessageType,
  body: z.optional(z.unknown()),
});

type ChannelMessage = z.infer<typeof ChannelMessage>;

export default ChannelMessage;
