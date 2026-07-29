import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../companies/entities/company.entity';
import { Route } from './entities/routes.entity';

@Injectable()
export class RoutesRepository {
  constructor(
    @InjectRepository(Route)
    private readonly routeRepo: Repository<Route>,
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
  ) {}

  async findAll(): Promise<Route[]> {
    return this.routeRepo.find({ relations: { company: true } });
  }

  async findById(id: number): Promise<Route | null> {
    return this.routeRepo.findOne({
      where: { id },
      relations: { company: true },
    });
  }

  async create(routeData: Partial<Route>): Promise<Route> {
    const newRoute = this.routeRepo.create(routeData);
    return this.routeRepo.save(newRoute);
  }

  async update(id: number, routeData: Partial<Route>): Promise<Route | null> {
    await this.routeRepo.update(id, routeData);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.routeRepo.delete(id);
  }
}
