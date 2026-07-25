import { ApiProperty } from '@nestjs/swagger';
import { DashboardCompanyResponseDto } from './dashboard-company-response.dto';
import { DashboardDocumentResponseDto } from './dashboard-document-response.dto';

export class DashboardCompanyDetailResponseDto extends DashboardCompanyResponseDto {
  @ApiProperty({ type: () => [DashboardDocumentResponseDto] })
  documents: DashboardDocumentResponseDto[];
}
