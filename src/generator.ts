import { compile } from 'json-schema-to-typescript'
import { createSchema, mergeSchemas } from 'genson-js';
import { DataConnector } from './data-connectors';

export async function generateTypeFromSamples(connector: DataConnector, ids: unknown[], outputTypeName: string): Promise<string> {
  const documents = await connector(ids);
  const schemas = documents.map(createSchema);
  const theSchema = mergeSchemas(schemas);
  const typeDefinition = await compile(theSchema, outputTypeName, { additionalProperties: false, bannerComment: '' })
  console.log(`Done - Type built from ${ids.length} samples`);
  return typeDefinition;
}