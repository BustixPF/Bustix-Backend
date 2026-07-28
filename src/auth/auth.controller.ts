import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  Redirect,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginUserDto } from './dto/login.user.dto';
import { ApiTags } from '@nestjs/swagger';
import { signInDecorator, signUpDecorator } from './auth.decorator';
import { AuthGuard } from '@nestjs/passport';
import { environment } from '../config/environment';

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
  async getGoogleCallback(@Req() req) {
    const data = await this.authService.googleLogin(req.user);

    const frontendUrl = `${environment.FRONTEND_URL}/google-callback`;

    return {
      url: `${frontendUrl}?token=${data.token}&email=${encodeURIComponent(data.user.email)}&name=${encodeURIComponent(data.user.name)}`,
      statusCode: 302,
    };
  }

  @Post('signin')
  @signInDecorator()
  async signIn(@Body() credentials: LoginUserDto) {
    return await this.authService.signIn(
      credentials.email,
      credentials.password,
    );
  }

  @Post('signup')
  @signUpDecorator()
  async signUp(@Body() user: CreateUserDto) {
    return await this.authService.signUp(user);
  }
}
