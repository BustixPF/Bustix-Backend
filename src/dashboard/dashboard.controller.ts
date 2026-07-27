import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { DashboardSummaryResponseDto } from './dto/dashboard-summary-response.dto';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  // Endpoint de ejemplo para obtener un resumen general
  @Get('summary')
  @ApiOperation({ summary: 'Obtiene un resumen general del dashboard' })
  @ApiOkResponse({ type: DashboardSummaryResponseDto })
  async getSummary(): Promise<DashboardSummaryResponseDto> {
    return this.dashboardService.getSummary();
  }
}
