import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { Company } from './entities/company.entity';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { CreateCompanyDto, UpdateCompanyDto } from './dto/company.dto';

@ApiTags('companies')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @ApiBody({ type: CreateCompanyDto })
  async create(@Body() body: CreateCompanyDto): Promise<Company> {
    return this.companiesService.createCompany(body);
  }

  @Get()
  async findAll(): Promise<Company[]> {
    return this.companiesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Company> {
    return this.companiesService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateCompanyDto,
  ): Promise<Company> {
    return this.companiesService.updateCompany(id, body);
  }
}
