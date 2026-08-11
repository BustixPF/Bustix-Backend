import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  ParseUUIDPipe,
  UseGuards,
  Req,
  ForbiddenException,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  createUsersDecorator,
  getAllUsersDecorator,
  getUsersByIdDecorator,
  updateUsersDecorator,
} from './users.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { Role } from '../common/roles.enum';
<<<<<<< Updated upstream
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
=======
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UpdateUserActiveDto } from './dto/update-user-active.dto';
>>>>>>> Stashed changes

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(Role.superAdmin)
  @createUsersDecorator()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(Role.superAdmin)
  @getAllUsersDecorator()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const validPage = pageNum > 0 ? pageNum : 1;
    const validLimit = limitNum > 0 ? Math.min(limitNum, 100) : 10;
    return this.usersService.findAll(validPage, validLimit);
  }

  @Get('profile')
  getProfile(@Req() req: AuthenticatedRequest) {
    return req.user;
  }

  @Patch(':id/role')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.superAdmin)
@ApiOperation({ summary: 'Cambiar el rol de un usuario (SuperAdmin)' })
async updateUserRole(
  @Param('id', ParseUUIDPipe) id: string,
  @Body() dto: UpdateUserRoleDto,
) {
  return this.usersService.updateUserRole(id, dto.role);
}

@Patch(':id/active')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.superAdmin)
  @ApiOperation({ summary: 'Cambiar el estado activo/inactivo de un usuario (SuperAdmin)' })
  async updateUserActive(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserActiveDto,
  ) {
    return this.usersService.updateUserActive(id, dto.isActive);
  }

  @Get(':id')
  @getUsersByIdDecorator()
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    if (req.user?.role !== Role.superAdmin && req.user?.id !== id) {
      throw new ForbiddenException('No podés consultar otro usuario');
    }
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @updateUsersDecorator()
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const isSelf = req.user?.id === id;
    const isSuperAdmin = req.user?.role === Role.superAdmin;

    if (!isSelf && !isSuperAdmin) {
      throw new ForbiddenException('No podés editar los datos de otro usuario');
    }
    if (!isSuperAdmin && (updateUserDto.role || updateUserDto.companyId)) {
      throw new ForbiddenException('No podés modificar tu rol o empresa');
    }
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const isSelf = req.user?.id === id;
    const isSuperAdmin = req.user?.role === Role.superAdmin;

    if (!isSelf && !isSuperAdmin) {
      throw new ForbiddenException('No podés eliminar otro usuario');
    }
    return this.usersService.remove(id);
  }
}
