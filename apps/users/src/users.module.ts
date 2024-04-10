import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { ItemsModule } from 'apps/items/src/items.module';
import { ItemsService } from 'apps/items/src/items.service';
@Module({
  imports: [ItemsModule],
  providers: [UsersService, ItemsService],
})
export class UsersModule {}