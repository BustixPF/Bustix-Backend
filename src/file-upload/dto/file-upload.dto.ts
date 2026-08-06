import { ApiProperty } from '@nestjs/swagger';

export class FileUploadDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;
}

export class FileUploadCompanyResponseDto {
  @ApiProperty({ example: 'logo.png' })
  filename: string;

  @ApiProperty({
    example: 'https://res.cloudinary.com/demo/image/upload/v123/logo.png',
  })
  url: string;

  @ApiProperty({ example: 'image/png' })
  mimetype: string;

  @ApiProperty({ example: 'uuid-de-la-empresa' })
  companyId: string;
}

export class FileUploadUserResponseDto {
  @ApiProperty({ example: 'avatar.png' })
  filename: string;

  @ApiProperty({
    example: 'https://res.cloudinary.com/demo/image/upload/v123/avatar.png',
  })
  url: string;

  @ApiProperty({ example: 'image/png' })
  mimetype: string;

  @ApiProperty({ example: 'uuid-del-usuario' })
  userId: string;
}
