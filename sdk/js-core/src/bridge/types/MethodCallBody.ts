import { z } from 'zod';

const MethodCallBody = z.object({
  methodName: z.string(),
  args: z.array(z.unknown()),
});

type MethodCallBody = z.infer<typeof MethodCallBody>;

export default MethodCallBody;
