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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('checkout-session')
  @ApiBearerAuth()
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
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
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
