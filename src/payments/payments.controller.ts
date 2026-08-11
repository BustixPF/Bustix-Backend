import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '../common/roles.enum';
import { Roles } from '../auth/roles.decorator';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('checkout-session')
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({
    description: 'Debes registrarte o iniciar sesión para comprar pasajes',
  })
  @UseGuards(JwtAuthGuard)
  createCheckoutSession(
    @Body() dto: CreateCheckoutSessionDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.paymentsService.createCheckoutSession(dto, req.user!.id);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.paymentsService.findOneForRequester(id, req.user!);
  }

  @Post(':id/refund')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.superAdmin, Role.Admin) // Roles permitidos
  @ApiOperation({ summary: 'Reembolsar o anular un pago (SuperAdmin)' })
  refundPayment(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.paymentsService.refundPayment(id, req.user!);
  }

  @Post('webhook')
  handleWebhook(
    @Req() request: Request & { rawBody?: Buffer },
    @Headers('stripe-signature') signature: string,
  ) {
    return this.paymentsService.handleWebhookEvent(
      request.rawBody as Buffer,
      signature,
    );
  }
}
