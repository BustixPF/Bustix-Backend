import {
  Body,
  Controller,
  Get,
  Post,
  Query,
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
  secure: isProduction,
  sameSite: isProduction ? ('none' as const) : ('lax' as const),
  maxAge: 1000 * 60 * 60 * 24,
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
  async getGoogleCallback(@Req() req: Request & { user: any }) {
    const data = await this.authService.googleLogin(req.user);
    const { token } = data as { token: string };

    return {
      url: `${environment.FRONTEND_URL}/api/auth/google/complete?token=${token}`,
      statusCode: 302,
    };
  }

  @Get('google/complete')
  @ApiOperation({
    summary: 'Termina el login de Google seteando la cookie same-site',
  })
  completeGoogleLogin(@Query('token') token: string, @Res() res: Response) {
    res.cookie('token', token, COOKIE_OPTIONS);
    return res.redirect(`${environment.FRONTEND_URL}/google-callback`);
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
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('token', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
    });
    return { message: 'Sesión cerrada correctamente' };
  }
}
