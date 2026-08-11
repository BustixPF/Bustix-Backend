import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './health.controller';
import { StripeHealthIndicator } from './health-stripe';
import { ConfigModule } from '@nestjs/config';

@Module({
 imports: [TerminusModule, HttpModule, ConfigModule],
  controllers: [HealthController],
  providers: [StripeHealthIndicator],
})
export class HealthModule {}