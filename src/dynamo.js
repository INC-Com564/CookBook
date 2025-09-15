
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  DeleteCommand,
  UpdateCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";
export async function updateItem(tableName, key, updates) {
  const command = new UpdateCommand({
    TableName: tableName,
    Key: key,
    UpdateExpression:
      "set " +
      Object.keys(updates)
        .map((k, i) => `#${k} = :${k}`)
        .join(", "),
    ExpressionAttributeNames: Object.keys(updates).reduce((acc, k) => {
      acc[`#${k}`] = k;
      return acc;
    }, {}),
    ExpressionAttributeValues: Object.keys(updates).reduce((acc, k) => {
      acc[`:${k}`] = updates[k];
      return acc;
    }, {}),
    ReturnValues: "ALL_NEW",
  });
  const result = await docClient.send(command);
  return result.Attributes;
}
export async function listAllItems(tableName) {
  const command = new ScanCommand({ TableName: tableName });
  const result = await docClient.send(command);
  return result.Items || [];
}

export async function getItem(tableName, key) {
  const command = new GetCommand({ TableName: tableName, Key: key });
  const result = await docClient.send(command);
  return result.Item || null;
}
const REGION = import.meta.env.VITE_APP_AWS_REGION;
const ACCESS_KEY_ID = import.meta.env.VITE_APP_AWS_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = import.meta.env.VITE_APP_AWS_SECRET_ACCESS_KEY;

if (!REGION || !ACCESS_KEY_ID || !SECRET_ACCESS_KEY) {
  throw new Error("Missing AWS environment variables. Check .env.local file.");
}

const client = new DynamoDBClient({
  region: REGION,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

const docClient = DynamoDBDocumentClient.from(client);

export async function createItem(tableName, item) {
  const command = new PutCommand({ TableName: tableName, Item: item });
  await docClient.send(command);
  return item;
}

export async function functionThatScansRecipes() {
  const command = new ScanCommand({ TableName: "Recipies" });
  const result = await docClient.send(command);
  return result.Items || [];
}
export async function deleteItem(tableName, key) {
  const command = new DeleteCommand({ TableName: tableName, Key: key });
  await docClient.send(command);
  console.log(`Item with key ${JSON.stringify(key)} deleted.`);
}
export async function deleteItemByKey(tableName, key) {
  const command = new DeleteCommand({
    TableName: tableName,
    Key: key,
    ReturnValues: "ALL_OLD",
  });
  await docClient.send(command);
}
