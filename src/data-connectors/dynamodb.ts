import { DynamoDB } from 'aws-sdk';
import _ from 'lodash';
import { DataConnector } from './types';

async function batchGet(dynamodbClient: DynamoDB.DocumentClient, input: DynamoDB.DocumentClient.BatchGetItemInput): Promise<DynamoDB.DocumentClient.BatchGetItemOutput> {
    try {
        return await dynamodbClient.batchGet(input).promise();
    } catch (error) {
        console.error(
        {
            method: 'batchGetItem',
            input: input,
            error: error,
        },
        'Caught DynamoDB error',
        );
        throw error;
    }
};

async function getDocuments(dynamodbClient: DynamoDB.DocumentClient, ids: unknown[], tableName: string, keyName: string) {
    const keys = ids.map((id) => ({ [keyName]: id }));
    const chunks = _.chunk(keys, 100);
    const responses = await Promise.all(
      chunks.map((c) => 
        batchGet(dynamodbClient, {
            RequestItems: {
                [tableName]: { Keys: c },
            },
        }),
      ),
    );
  
    return responses.flatMap(
      (r) => r?.Responses?.[tableName] ?? [],
    );
  }

export function createDynamoDbConnector(region: string, tableName: string, keyName: string): DataConnector {
    const dynamodbClient = new DynamoDB.DocumentClient({ region });
    return async function(ids: unknown[]): Promise<unknown> {
        return await getDocuments(dynamodbClient, ids, tableName, keyName);
    }
}
