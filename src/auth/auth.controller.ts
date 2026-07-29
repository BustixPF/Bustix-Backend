import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  Redirect,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginUserDto } from './dto/login.user.dto';
import { ApiTags } from '@nestjs/swagger';
import { signInDecorator, signUpDecorator } from './auth.decorator';
import { AuthGuard } from '@nestjs/passport';
import { environment } from '../config/environment';
import type { Response } from 'express';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async getGoogle() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @Redirect()
  async getGoogleCallback(
    @Req() req,
    @Res({ passthrough: true }) res: Response,
  ) {
    const data = await this.authService.googleLogin(req.user);

    res.cookie('token', data.token, {
      httpOnly: true,
      secure: environment.NODE_ENV === 'produccion',
      sameSite: environment.NODE_ENV === 'produccion' ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 24,
    });

    const frontendUrl = `${environment.FRONTEND_URL}/google-callback`;

    return {
      url: `${frontendUrl}?token=${data.token}&email=${encodeURIComponent(data.user.email)}&name=${encodeURIComponent(data.user.name)}`,
      statusCode: 302,
    };
  }

  @Post('signin')
  @signInDecorator()
  async signIn(
    @Body() credentials: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const data = await this.authService.signIn(
      credentials.email,
      credentials.password,
    );

    res.cookie('token', data.token, {
      httpOnly: true,
      secure: environment.NODE_ENV === 'produccion',
      sameSite: environment.NODE_ENV === 'produccion' ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 24,
    });

    return data;
  }

  @Post('signup')
  @signUpDecorator()
  async signUp(@Body() user: CreateUserDto) {
    return await this.authService.signUp(user);
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('token');
    return { message: 'Sesión cerrada correctamente' };
  }
}
