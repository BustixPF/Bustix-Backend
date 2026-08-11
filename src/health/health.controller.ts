import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
  HttpHealthIndicator,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../common/roles.enum';
import { StripeHealthIndicator } from './health-stripe';

@ApiTags('Dashboard SuperAdmin Health')
@Controller('dashboard/superadmin/health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
    private readonly http: HttpHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly stripeHealth: StripeHealthIndicator,
  ) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.superAdmin)
  @ApiOperation({ summary: 'Obtener el estado de salud del sistema (SuperAdmin)' })
  @HealthCheck()
  check() {
    return this.health.check([
      // 1. Base de Datos
      () => this.db.pingCheck('database', { timeout: 3000 }),

      // 2. Consumo de Memoria Heap
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),

      // 3. Pasarela Stripe (Validación autenticada mediante el SDK)
      () => this.stripeHealth.isHealthy('stripe_gateway'),

      // 4. Salida a Internet / Conectividad general
      () => this.http.pingCheck('external_services', 'https://www.google.com'),
    ]);
  }
}