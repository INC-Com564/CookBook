import { describe, it, expect, beforeEach } from "vitest";
import { mockClient } from "aws-sdk-client-mock";
import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";

import { createItem, listAllItems, getItem } from "./dynamo.js";

const ddbMock = mockClient(DynamoDBDocumentClient);

beforeEach(() => {
  ddbMock.reset();
});

describe("CRUD (unit, mocked) with Vitest", () => {
  it("createItem returns the same item", async () => {
    ddbMock.on(PutCommand).resolves({});
    const item = { id: "1", text: "hi" };
    const out = await createItem("Testing", item);
    expect(out).toEqual(item);
  });

  it("listAllItems returns items when present", async () => {
    const items = [{ id: "1" }, { id: "2" }];
    ddbMock.on(ScanCommand).resolves({ Items: items });
    const out = await listAllItems("Testing");
    expect(out).toEqual(items);
  });

  it("listAllItems returns empty array when no items", async () => {
    ddbMock.on(ScanCommand).resolves({});
    const out = await listAllItems("Testing");
    expect(out).toEqual([]);
  });

  it("getItem returns item when found", async () => {
    const item = { id: "1", text: "hi" };
    ddbMock.on(GetCommand).resolves({ Item: item });
    const out = await getItem("Testing", { id: "1" });
    expect(out).toEqual(item);
  });

  it("getItem returns null when not found", async () => {
    ddbMock.on(GetCommand).resolves({});
    const out = await getItem("Testing", { id: "1" });
    expect(out).toBeNull();
  });
  
});