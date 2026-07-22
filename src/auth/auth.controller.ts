import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginUserDto } from './dto/login.user.dto';
import { ApiTags } from '@nestjs/swagger';
import { signInDecorator, signUpDecorator } from './auth.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
