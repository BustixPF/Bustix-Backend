import { ApiProperty } from '@nestjs/swagger';

export class DashboardCompanyResponseDto {
  @ApiProperty({ example: 'e8a0d2f2-c9d8-4fb1-9168-dc311f5114b3' })
  id: string;

  @ApiProperty({ example: 'BusAndes' })
  name: string;

  @ApiProperty({ example: '902555667-7' })
  nit: string;

  @ApiProperty({ example: 'ventas@busandes.com' })
  email: string;

  @ApiProperty({ example: '5551234' })
  phone: string;

}
