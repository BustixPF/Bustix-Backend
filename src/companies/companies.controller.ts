import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { Company } from './entities/company.entity';
import { ApiTags } from '@nestjs/swagger';
import { createCompaniesDecorator, findAllCompaniesDecorator, findCompaniesByIdDecorator} from './companies.decorator';

@ApiTags('companies')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @createCompaniesDecorator()
  async create(@Body() body: Partial<Company>) {
    return this.companiesService.createCompany(body);
  }

  @Get()
  @findAllCompaniesDecorator()
  async findAll() {
    return this.companiesService.findAll();
  }

  @Get(':id')
  @findCompaniesByIdDecorator()
  async findOne(@Param('id') id: string) {
    return this.companiesService.findOne(id);
  }
}
