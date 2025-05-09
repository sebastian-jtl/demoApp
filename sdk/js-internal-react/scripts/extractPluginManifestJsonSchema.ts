import fs from 'fs';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { PluginManifest } from '../src/domain/types';

const jsonSchema = zodToJsonSchema(PluginManifest);

fs.writeFileSync('dist/plugin-manifest.schema.json', JSON.stringify(jsonSchema, null, 2));
