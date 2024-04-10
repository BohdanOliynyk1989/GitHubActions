import { HttpStatus } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Callback, Context, Handler } from 'aws-lambda';
import { UsersModule } from './users.module';
import { UsersService } from './users.service';

export const getUser: Handler = async (
  event: any,
  _context: Context,
  _callback: Callback,
) => {
  const appContext = await NestFactory.createApplicationContext(UsersModule);
  const appService = appContext.get(UsersService);
  const { id } = event.pathParameters;
  try {
    const res = await appService.getUser(id);
    return {
      statusCode: HttpStatus.OK,
      body: JSON.stringify(res),
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: HttpStatus.BAD_REQUEST,
      body: JSON.stringify(error.response ?? error.message),
    };
  }
};

export const getUsers: Handler = async (
  _event: any,
  _context: Context,
  _callback: Callback,
) => {
  const appContext = await NestFactory.createApplicationContext(UsersModule);
  const appService = appContext.get(UsersService);
  try {
    const res = await appService.getUsers();
    return {
      statusCode: HttpStatus.OK,
      body: res,
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: HttpStatus.BAD_REQUEST,
      body: JSON.stringify(error.response ?? error.message),
    };
  }
};