import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../common/roles.enum';
import { MetricsService } from './metric.service';
import { GetMetricsDto } from './dto/metric-dto';

@ApiTags('admin-metrics')
@Controller('admin/metrics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.superAdmin)
@ApiBearerAuth()
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @ApiOperation({
    summary:
      'Obtener métricas y reportes globales de la plataforma (SuperAdmin)',
  })
  getMetrics(@Query() dto: GetMetricsDto) {
    return this.metricsService.getGlobalMetrics(dto);
  }
}
