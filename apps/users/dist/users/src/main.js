"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = exports.getUser = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const users_module_1 = require("./users.module");
const users_service_1 = require("./users.service");
const getUser = async (event, _context, _callback) => {
    const appContext = await core_1.NestFactory.createApplicationContext(users_module_1.UsersModule);
    const appService = appContext.get(users_service_1.UsersService);
    const { id } = event.pathParameters;
    try {
        const res = await appService.getUser(id);
        return {
            statusCode: common_1.HttpStatus.OK,
            body: JSON.stringify(res),
        };
    }
    catch (error) {
        console.log(error);
        return {
            statusCode: common_1.HttpStatus.BAD_REQUEST,
            body: JSON.stringify(error.response ?? error.message),
        };
    }
};
exports.getUser = getUser;
const getUsers = async (_event, _context, _callback) => {
    const appContext = await core_1.NestFactory.createApplicationContext(users_module_1.UsersModule);
    const appService = appContext.get(users_service_1.UsersService);
    try {
        const res = await appService.getUsers();
        return {
            statusCode: common_1.HttpStatus.OK,
            body: res,
        };
    }
    catch (error) {
        console.log(error);
        return {
            statusCode: common_1.HttpStatus.BAD_REQUEST,
            body: JSON.stringify(error.response ?? error.message),
        };
    }
};
exports.getUsers = getUsers;
//# sourceMappingURL=main.js.map