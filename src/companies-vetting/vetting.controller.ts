import { Controller, Post, Body, Patch, Param, Get } from '@nestjs/common';
import { VettingService } from './vetting.service';

@Controller('companies-vetting')
export class VettingController {
  constructor(private readonly vettingService: VettingService) {}

  @Post('verify')
  async verifyCompany(@Body() body: { companyId: string; fileUrl: string }) {
    return this.vettingService.verifyCompany(body.companyId, body.fileUrl);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: 'approved' | 'rejected'; notes?: string },
  ) {
    return this.vettingService.changeStatus(id, body.status, body.notes);
  }

  @Get(':companyId')
  async getCompanyRecords(@Param('companyId') companyId: string) {
    return this.vettingService.getCompanyRecords(companyId);
  }
}
