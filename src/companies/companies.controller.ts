import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { Company } from './entities/company.entity';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { CreateCompanyDto, UpdateCompanyDto } from './dto/company.dto';
import { CompanyStatus } from '../common/company-status.enum';
import {
  createCompaniesDecorator,
  findAllCompaniesDecorator,
  findCompaniesByIdDecorator,
  updateCompanyDecorator,
  approveCompanyDecorator,
  rejectCompanyDecorator,
} from './companies.decorator';

@ApiTags('companies')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @createCompaniesDecorator()
  @ApiBody({ type: CreateCompanyDto })
  async create(@Body() body: CreateCompanyDto): Promise<Company> {
    return this.companiesService.createCompany(body);
  }

  @Get()
  @findAllCompaniesDecorator()
  async findAll(): Promise<Company[]> {
    return this.companiesService.findAll();
  }

  @Get(':id')
  @findCompaniesByIdDecorator()
  async findOne(@Param('id') id: string): Promise<Company> {
    return this.companiesService.findOne(id);
  }

  @Patch(':id')
  @updateCompanyDecorator()
  async update(
    @Param('id') id: string,
    @Body() body: UpdateCompanyDto,
  ): Promise<Company> {
    return this.companiesService.updateCompany(id, body);
  }

  @Patch(':id/approve')
  @approveCompanyDecorator()
  async approve(@Param('id') id: string): Promise<Company> {
    return this.companiesService.updateCompanyStatus(
      id,
      CompanyStatus.APPROVED,
    );
  }

  @Patch(':id/reject')
  @rejectCompanyDecorator()
  async reject(@Param('id') id: string): Promise<Company> {
    return this.companiesService.updateCompanyStatus(
      id,
      CompanyStatus.REJECTED,
    );
  }
}
