import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VettingEntity } from './entities/vetting.entity';
import { VettingController } from './vetting.controller';
import { VettingService } from './vetting.service';
import { VettingRepository } from './vetting.repository';

@Module({
  imports: [TypeOrmModule.forFeature([VettingEntity])],
  controllers: [VettingController],
  providers: [VettingService, VettingRepository],
})
export class VettingModule {}
