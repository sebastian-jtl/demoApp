import { describe, it, expect } from 'vitest';
import PluginManifest from '../value-objects/PluginManifest';

describe('PluginManifest', () => {
  it('should be defined', () => {
    expect(PluginManifest).toBeDefined();
  });

  it('should pass valid plugin manifest', () => {
    // Arrange
    const validPluginManifest = {
      manifestVersion: '1.0.0',
      version: '1.0.0',
      name: {
        short: 'Demo __TK_key1__',
        full: 'The official plugin for Demo',
      },
      description: {
        short: 'Lorem ipsum.',
        full: 'Minions ipsum gelatooo uuuhhh para tú bappleees para tú tank yuuu! Gelatooo po kass. Bappleees poopayee tulaliloo pepete belloo! Wiiiii.',
      },
      defaultLocale: 'de-DE',
      locales: {
        'de-DE': {
          key1: 'abc',
        },
        en: {
          key1: 'abc',
        },
      },
      icon: {
        light: 'https://demogmbh.com/assets/logo-light.svg',
        dark: 'https://demogmbh.com/assets/logo-dark.svg',
      },
      communication: {
        supportUrl: 'https://demogmbh.com/support-for-plugin-xy/__ACTIVE_LOCALE__/',
        guideUrl: 'https://demogmbh.com/guide-for-plugin-xy?lang=__ACTIVE_LOCALE__',
      },
      legal: {
        gdprRequestUrl: 'https://demogmbh.com/gdpr/request',
        gdprDeleteUrl: 'https://demogmbh.com/gdpr/delete',
        privacyUrl: 'https://demogmbh.com/privacy',
        termsOfUseUrl: 'https://demogmbh.com/terms-of-use',
      },
      lifecycle: {
        connectUrl: 'https://jtl.integrations.demogmbh.com/lifecycle/connect',
        disconnectUrl: 'https://jtl.integrations.demogmbh.com/lifecycle/disconnect',
      },
      requirements: {
        minCloudApiVersion: 'version12',
      },
      capabilities: {
        hub: {
          appLauncher: {
            redirectUrl: 'https://app.demogmbh.com/?login-provider=jtl',
          },
        },
        erp: {
          headless: {
            // This URL will be rendered in a iframe with 0x0 pixels size
            // - using this approach the iFrame Security Features are available and the Bridge works normally
            url: 'https://jtl.integrations.demogmbh.com/wawi/headless',
          },
          menuItems: [
            {
              id: 'overview',
              name: 'Demo GmbH Overview',
              url: 'https://jtl.integrations.demogmbh.com/wawi/pages/home',
            },
            {
              id: 'features',
              name: 'Demo GmbH Features',
              url: 'https://jtl.integrations.demogmbh.com/wawi/pages/features',
              children: [
                {
                  id: 'features_ai',
                  // This menu item has no URL, which means it can only toggle collapsible state
                  name: 'AI',
                  children: [
                    {
                      id: 'features_ai_image',
                      name: 'Image generation',
                      url: 'https://jtl.integrations.demogmbh.com/wawi/pages/features/ai/image',
                    },
                    {
                      id: 'features_ai_text',
                      name: 'Text generation',
                      url: 'https://jtl.integrations.demogmbh.com/wawi/pages/features/ai/text',
                    },
                  ],
                },
              ],
            },
          ],
          tabs: [
            {
              context: 'productDetail',
              name: 'Demo data',
              url: 'https://jtl.integrations.demogmbh.com/wawi/tabs/product/detail',
              features: ['details:full', 'pricing:write'],
            },
            {
              context: 'customerDetail',
              name: 'Demo data',
              url: 'https://jtl.integrations.demogmbh.com/wawi/tabs/customer/detail',
              features: ['details:write', 'address:read'],
            },
          ],
          api: {
            scopes: ['productRead', 'productDelete'],
          },
        },
      },
    };

    // Act
    const result = PluginManifest.safeParse(validPluginManifest);

    // Assert
    if (!result.success) {
      console.error(result.error.errors);
    }
    expect(result.success).toBe(true);
  });
});
