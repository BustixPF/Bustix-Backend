import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '../common/roles.enum';
import { NotificationsService } from './notifications.service';
import { SendTestEmailDto } from './dto/send-test-email.dto';
import { SendCompanyRequestDecisionTestEmailDto } from './dto/send-company-request-decision-test-email.dto';
import { SendRoleChangedTestEmailDto } from './dto/send-role-changed-test-email.dto';
import { SendTicketPurchaseConfirmedTestEmailDto } from './dto/send-ticket-purchase-confirmed-test-email.dto';
import { SendCompanyRequestReceivedTestEmailDto } from './dto/send-company-request-received-test-email.dto';
import { SendRouteRequestReceivedTestEmailDto } from './dto/send-route-request-received-test-email.dto';
import { SendTravelReminderTestEmailDto } from './dto/send-travel-reminder-test-email.dto';

@ApiTags('notifications')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Token no proporcionado o invalido' })
@ApiForbiddenResponse({ description: 'Rol insuficiente' })
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.superAdmin)
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
      companyId: dto.companyId,
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
      companyId: dto.companyId,
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
      seatNumbers: dto.seatNumbers,
    });

    return {
      message: 'Solicitud de email de compra confirmada procesada',
      email: dto.email,
      paymentId: dto.paymentId,
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

  @Post('test-travel-reminder-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enviar un recordatorio de viaje de prueba' })
  @ApiBody({ type: SendTravelReminderTestEmailDto })
  @ApiOkResponse({
    description: 'Recordatorio enviado mediante Brevo',
    schema: {
      example: {
        message: 'Email de recordatorio enviado',
        email: 'pasajero@example.com',
        hoursBefore: 48,
      },
    },
  })
  async sendTravelReminderTestEmail(
    @Body() dto: SendTravelReminderTestEmailDto,
  ) {
    await this.notificationsService.sendTravelReminderEmail({
      email: dto.email,
      name: dto.name ?? 'Usuario de prueba',
      origin: dto.origin,
      destination: dto.destination,
      departureDate: new Date(dto.departureDate),
      seatNumbers: dto.seatNumbers,
      hoursBefore: dto.hoursBefore,
    });

    return {
      message: 'Email de recordatorio enviado',
      email: dto.email,
      hoursBefore: dto.hoursBefore,
    };
  }
}
