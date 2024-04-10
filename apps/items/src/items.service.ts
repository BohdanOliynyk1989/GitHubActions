import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { v1 } from 'uuid';
import { DynamoDB } from 'aws-sdk';

const db = new DynamoDB.DocumentClient();

@Injectable()
export class ItemsService {
  async createItem(item: any) {
    const { title, description } = item;
    const createdOn = new Date().getTime();

    const data = {
      TableName: process.env.DYNAMODB_TABLE,
      Item: {
        id: v1(),
        title,
        description,
        createdOn,
      },
    };

    try {
      await db.put(data).promise();
      return item;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getItem(id: string) {
    const params = {
      TableName: process.env.DYNAMODB_TABLE,
      Key: { id },
    };

    try {
      const result = await db.get(params).promise();
      return result.Item;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getItems() {
    const params = {
      TableName: process.env.DYNAMODB_TABLE,
    };

    try {
      return '123123123';
      const result = await db.scan(params).promise();
      return result.Items;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}