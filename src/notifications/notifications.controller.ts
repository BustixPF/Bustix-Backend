import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { SendTestEmailDto } from './dto/send-test-email.dto';
import { SendCompanyRequestDecisionTestEmailDto } from './dto/send-company-request-decision-test-email.dto';
import { SendRoleChangedTestEmailDto } from './dto/send-role-changed-test-email.dto';
import { SendTicketPurchaseConfirmedTestEmailDto } from './dto/send-ticket-purchase-confirmed-test-email.dto';
import { SendPaymentCanceledTestEmailDto } from './dto/send-payment-canceled-test-email.dto';
import { SendCompanyRequestReceivedTestEmailDto } from './dto/send-company-request-received-test-email.dto';
import { SendRouteRequestReceivedTestEmailDto } from './dto/send-route-request-received-test-email.dto';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('test-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Enviar un email de prueba usando la configuracion actual',
  })
  @ApiBody({ type: SendTestEmailDto })
  @ApiOkResponse({
    description: 'Solicitud del correo de prueba procesada correctamente',
    schema: {
      example: {
        message: 'Solicitud de email de prueba procesada',
        email: 'demo@bustix.com',
      },
    },
  })
  async sendTestEmail(@Body() dto: SendTestEmailDto) {
    await this.notificationsService.sendWelcomeEmail({
      email: dto.email,
      name: dto.name ?? 'Usuario de prueba',
    });

    return {
      message: 'Solicitud de email de prueba procesada',
      email: dto.email,
    };
  }

  @Post('test-company-request-decision-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Enviar un email de prueba para aprobacion o rechazo de solicitud de empresa',
  })
  @ApiBody({ type: SendCompanyRequestDecisionTestEmailDto })
  @ApiOkResponse({
    description: 'Solicitud del correo de decision procesada correctamente',
    schema: {
      example: {
        message: 'Solicitud de email de decision procesada',
        email: 'empresa@bustix.com',
        status: 'accepted',
      },
    },
  })
  async sendCompanyRequestDecisionTestEmail(
    @Body() dto: SendCompanyRequestDecisionTestEmailDto,
  ) {
    await this.notificationsService.sendCompanyRequestDecisionEmail({
      email: dto.email,
      name: dto.name ?? 'Empresa de prueba',
      status: dto.status,
      message: dto.message,
    });

    return {
      message: 'Solicitud de email de decision procesada',
      email: dto.email,
      status: dto.status,
    };
  }

  @Post('test-role-changed-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Enviar un email de prueba para cambio de rol',
  })
  @ApiBody({ type: SendRoleChangedTestEmailDto })
  @ApiOkResponse({
    description:
      'Solicitud del correo de cambio de rol procesada correctamente',
    schema: {
      example: {
        message: 'Solicitud de email de cambio de rol procesada',
        email: 'usuario@bustix.com',
        role: 'admin',
      },
    },
  })
  async sendRoleChangedTestEmail(@Body() dto: SendRoleChangedTestEmailDto) {
    await this.notificationsService.sendRoleChangedEmail({
      email: dto.email,
      name: dto.name ?? 'Usuario de prueba',
      role: dto.role,
    });

    return {
      message: 'Solicitud de email de cambio de rol procesada',
      email: dto.email,
      role: dto.role,
    };
  }

  @Post('test-ticket-purchase-confirmed-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Enviar un email de prueba para compra confirmada',
  })
  @ApiBody({ type: SendTicketPurchaseConfirmedTestEmailDto })
  @ApiOkResponse({
    description:
      'Solicitud del correo de compra confirmada procesada correctamente',
    schema: {
      example: {
        message: 'Solicitud de email de compra confirmada procesada',
        email: 'comprador@bustix.com',
        paymentId: 'pay_123456',
      },
    },
  })
  async sendTicketPurchaseConfirmedTestEmail(
    @Body() dto: SendTicketPurchaseConfirmedTestEmailDto,
  ) {
    await this.notificationsService.sendTicketPurchaseConfirmedEmail({
      email: dto.email,
      name: dto.name ?? 'Usuario de prueba',
      origin: dto.origin,
      destination: dto.destination,
      departureDate: dto.departureDate ? new Date(dto.departureDate) : null,
      seatCount: dto.seatCount,
      totalAmount: dto.totalAmount,
      currency: dto.currency,
      paymentId: dto.paymentId,
    });

    return {
      message: 'Solicitud de email de compra confirmada procesada',
      email: dto.email,
      paymentId: dto.paymentId,
    };
  }

  @Post('test-payment-canceled-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Enviar un email de prueba para pago cancelado o expirado',
  })
  @ApiBody({ type: SendPaymentCanceledTestEmailDto })
  @ApiOkResponse({
    description:
      'Solicitud del correo de pago cancelado procesada correctamente',
    schema: {
      example: {
        message: 'Solicitud de email de pago cancelado procesada',
        email: 'comprador@bustix.com',
      },
    },
  })
  async sendPaymentCanceledTestEmail(
    @Body() dto: SendPaymentCanceledTestEmailDto,
  ) {
    await this.notificationsService.sendPaymentCanceledEmail({
      email: dto.email,
      name: dto.name ?? 'Usuario de prueba',
      origin: dto.origin,
      destination: dto.destination,
      seatCount: dto.seatCount,
      totalAmount: dto.totalAmount,
      currency: dto.currency,
    });

    return {
      message: 'Solicitud de email de pago cancelado procesada',
      email: dto.email,
    };
  }

  @Post('test-company-request-received-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Enviar un email de prueba para solicitud de empresa recibida',
  })
  @ApiBody({ type: SendCompanyRequestReceivedTestEmailDto })
  @ApiOkResponse({
    description:
      'Solicitud del correo de solicitud de empresa procesada correctamente',
    schema: {
      example: {
        message: 'Solicitud de email de solicitud de empresa procesada',
        email: 'empresa@bustix.com',
        companyName: 'Transporte Demo',
      },
    },
  })
  async sendCompanyRequestReceivedTestEmail(
    @Body() dto: SendCompanyRequestReceivedTestEmailDto,
  ) {
    await this.notificationsService.sendCompanyRequestReceivedEmail({
      email: dto.email,
      name: dto.name ?? dto.companyName,
      companyName: dto.companyName,
    });

    return {
      message: 'Solicitud de email de solicitud de empresa procesada',
      email: dto.email,
      companyName: dto.companyName,
    };
  }

  @Post('test-route-request-received-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Enviar un email de prueba para solicitud de ruta recibida',
  })
  @ApiBody({ type: SendRouteRequestReceivedTestEmailDto })
  @ApiOkResponse({
    description:
      'Solicitud del correo de solicitud de ruta procesada correctamente',
    schema: {
      example: {
        message: 'Solicitud de email de solicitud de ruta procesada',
        email: 'admin@bustix.com',
        type: 'add',
      },
    },
  })
  async sendRouteRequestReceivedTestEmail(
    @Body() dto: SendRouteRequestReceivedTestEmailDto,
  ) {
    await this.notificationsService.sendRouteRequestReceivedEmail({
      email: dto.email,
      name: dto.name ?? 'Usuario de prueba',
      type: dto.type,
      origin: dto.origin,
      destination: dto.destination,
      routeId: dto.routeId,
    });

    return {
      message: 'Solicitud de email de solicitud de ruta procesada',
      email: dto.email,
      type: dto.type,
    };
  }
}
