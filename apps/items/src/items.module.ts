import { Module } from '@nestjs/common';
import { ItemsService } from './items.service';

@Module({
  imports: [],
  providers: [ItemsService],
})
export class ItemsModule {}