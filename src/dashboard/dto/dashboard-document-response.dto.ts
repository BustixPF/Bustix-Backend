import { ApiProperty } from '@nestjs/swagger';

export class DashboardDocumentResponseDto {
  @ApiProperty({ example: '5f748fd1-2a8f-47ec-93f2-8dcaf6dfe6de' })
  id: string;

  @ApiProperty({
    example:
      'https://res.cloudinary.com/demo/image/upload/v123456789/companies/doc.pdf',
  })
  url: string;

  @ApiProperty({ example: 'camara-comercio.pdf' })
  filename: string;

  @ApiProperty({ example: 'application/pdf' })
  mimetype: string;
}
