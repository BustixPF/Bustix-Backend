import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { Company } from './entities/company.entity';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  async create(@Body() body: Partial<Company>) {
    return this.companiesService.createCompany(body);
  }

  @Get()
  async findAll() {
    return this.companiesService.findAll();
  }

  // 👇 pon el seeder ANTES del ':id'
  @Get('seeder')
  async seedCompanies() {
    return this.companiesService.seedCompanies();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.companiesService.findOne(id);
  }
}
