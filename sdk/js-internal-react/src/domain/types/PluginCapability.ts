import PluginManifest from './value-objects/PluginManifest';

type PluginCapability = keyof PluginManifest['capabilities'];

export default PluginCapability;
