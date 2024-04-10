import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ItemsService } from 'apps/items/src/items.service';
import { DynamoDB } from 'aws-sdk';

const db = new DynamoDB.DocumentClient({
  convertEmptyValues: true,
  paramValidation: true,
});

@Injectable()
export class UsersService {
  constructor(
    private readonly itemsService: ItemsService
  ) {}
  async getUser(id: string) {
    const res = await db
      .get({
        TableName: process.env.DYNAMODB_TABLE,
        Key: { id },
        AttributesToGet: ['id', 'email', 'firstName', 'lastName'],
      })
      .promise();
    if (res.$response.error || !res.Item) {
      throw new InternalServerErrorException(res.$response.error);
    }
    return res.Item;
  }
 async getUsers() {
    return this.itemsService.getItems();
    // const res = await db
    //   .scan({
    //     TableName: process.env.DYNAMODB_TABLE,
    //     AttributesToGet: ['id', 'email', 'firstName', 'lastName'],
    //   })
    //   .promise();
    // if (res.$response.error) {
    //   throw new InternalServerErrorException(res.$response.error.message);
    // }
    // return res.Items;
  }
}