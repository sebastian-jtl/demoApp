import { z } from 'zod';

const MessageType = z.enum(['HANDSHAKE', 'EVENT_TRIGGER', 'EVENT_TRIGGER_CONFIRMATION', 'METHOD_CALL', 'METHOD_CALL_RETURN', 'METHOD_CALL_ERROR']);

type MessageType = z.infer<typeof MessageType>;

export default MessageType;
