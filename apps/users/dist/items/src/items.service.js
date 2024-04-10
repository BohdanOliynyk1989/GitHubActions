"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemsService = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const aws_sdk_1 = require("aws-sdk");
const db = new aws_sdk_1.DynamoDB.DocumentClient();
let ItemsService = class ItemsService {
    async createItem(item) {
        const { title, description } = item;
        const createdOn = new Date().getTime();
        const data = {
            TableName: process.env.DYNAMODB_TABLE,
            Item: {
                id: (0, uuid_1.v1)(),
                title,
                description,
                createdOn,
            },
        };
        try {
            await db.put(data).promise();
            return item;
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(error.message);
        }
    }
    async getItem(id) {
        const params = {
            TableName: process.env.DYNAMODB_TABLE,
            Key: { id },
        };
        try {
            const result = await db.get(params).promise();
            return result.Item;
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(error.message);
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
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(error.message);
        }
    }
};
exports.ItemsService = ItemsService;
exports.ItemsService = ItemsService = __decorate([
    (0, common_1.Injectable)()
], ItemsService);
//# sourceMappingURL=items.service.js.map