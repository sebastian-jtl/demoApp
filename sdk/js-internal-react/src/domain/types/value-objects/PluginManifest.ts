import { z } from 'zod';

const MenuItemBase = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string().url().optional(),
});

type MenuItem = z.infer<typeof MenuItemBase> & {
  children?: MenuItem[];
};

const MenuItem: z.ZodType<MenuItem> = MenuItemBase.extend({
  children: z.lazy(() => MenuItem.array()).optional(),
});

const PluginManifest = z.object({
  manifestVersion: z.string(),
  version: z.string(),
  name: z.object({
    short: z.string(),
    full: z.string(),
  }),
  description: z.object({
    short: z.string(),
    full: z.string(),
  }),
  defaultLocale: z.string(),
  locales: z.record(z.string(), z.record(z.string(), z.string())),
  icon: z.object({
    light: z.string().url(),
    dark: z.string().url(),
  }),
  communication: z.object({
    supportUrl: z.string().url(),
    guideUrl: z.string().url(),
  }),
  legal: z.object({
    gdprRequestUrl: z.string().url(),
    gdprDeleteUrl: z.string().url(),
    privacyUrl: z.string().url(),
    termsOfUseUrl: z.string().url(),
  }),
  lifecycle: z.optional(
    z.object({
      setupUrl: z.optional(z.string().url()),
      connectUrl: z.optional(z.string().url()),
      disconnectUrl: z.optional(z.string().url()),
    }),
  ),
  capabilities: z.object({
    hub: z
      .object({
        appLauncher: z.object({
          redirectUrl: z.string().url(),
        }),
      })
      .optional(),
    erp: z
      .object({
        headless: z
          .object({
            url: z.string().url(),
          })
          .optional(),
        menuItems: z.array(MenuItem).optional(),
        tabs: z
          .array(
            z.object({
              context: z.enum(['productDetail', 'customerDetail']),
              name: z.string(),
              url: z.string().url(),
              features: z.array(z.enum(['details:write', 'details:full', 'address:read', 'pricing:write'])),
            }),
          )
          .optional(),
        api: z
          .object({
            scopes: z.array(z.enum(['productRead', 'productDelete'])),
          })
          .optional(),
        inline: z.object({}).optional(),
      })
      .optional(),
  }),
});

type PluginManifest = z.infer<typeof PluginManifest>;

export default PluginManifest;
