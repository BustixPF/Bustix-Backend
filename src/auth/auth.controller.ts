import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  Redirect,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginUserDto } from './dto/login.user.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { environment } from '../config/environment';
import type { Response, Request } from 'express';

const isProduction =
  environment.NODE_ENV === 'production' ||
  environment.NODE_ENV === 'produccion';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction, // En produccion DEBE ser true para HTTPS
  sameSite: isProduction ? ('none' as const) : ('lax' as const), // 'none' permite cookies cross-origin entre Vercel y Railway
  maxAge: 1000 * 60 * 60 * 24, // 24 Horas
};

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Iniciar autenticación con Google' })
  async getGoogle() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @Redirect()
  async getGoogleCallback(
    @Req() req: Request & { user: any },
    @Res({ passthrough: true }) res: Response,
  ) {
    const data = await this.authService.googleLogin(req.user);

    res.cookie('token', data.token, COOKIE_OPTIONS);

    const frontendUrl = `${environment.FRONTEND_URL}/google-callback`;

    return {
      url: `${frontendUrl}?token=${data.token}&email=${encodeURIComponent(
        data.user.email,
      )}&name=${encodeURIComponent(data.user.name)}`,
      statusCode: 302,
    };
  }

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registro de nuevo usuario' })
  async signUp(@Body() userDto: CreateUserDto) {
    return await this.authService.signUp(userDto);
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Inicio de sesión con credenciales' })
  async signIn(
    @Body() credentials: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const data = await this.authService.signIn(
      credentials.email,
      credentials.password,
    );

    res.cookie('token', data.token, COOKIE_OPTIONS);

    return data;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cerrar sesión y limpiar cookies' })
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('token', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
    });
    return { message: 'Sesión cerrada correctamente' };
  }
}
