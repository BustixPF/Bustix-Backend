import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { SendTestEmailDto } from './dto/send-test-email.dto';
import { SendCompanyRequestDecisionTestEmailDto } from './dto/send-company-request-decision-test-email.dto';
import { SendRoleChangedTestEmailDto } from './dto/send-role-changed-test-email.dto';

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
    description: 'Solicitud del correo de cambio de rol procesada correctamente',
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
}
